<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import Footer from '~/components/Layout/Footer.vue'
import {
  Flame, Search, X, ChevronUp, ShoppingCart,
  RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-vue-next'

// ===================== TYPES =====================

type Produto = {
  id: string
  nome: string
  preco2: string
  tipo: string
  img: string
  quantidade: number
}

// ===================== STATE =====================

const { adicionarCarrinho } = useCarrinho()

const produtos       = ref<Produto[]>([])
const carregando     = ref(true)   // ← já começa true: skeleton aparece instantaneamente
const erro           = ref(false)

const paginaAtual    = ref(1)
const totalPaginas   = ref(1)
const totalProdutos  = ref(0)
const cacheCompleto  = ref(false)

const busca          = ref('')
const buscaDebounce  = ref('')
const modalProduto   = ref<Produto | null>(null)
const mostrarTopo    = ref(false)

let timeoutBusca: ReturnType<typeof setTimeout> | null = null
let pollingTimer: ReturnType<typeof setInterval> | null = null

const FALLBACK = '/sem-imagem.png'

// ===================== FETCH =====================

async function buscarProdutos(pagina = 1) {
  carregando.value = true
  erro.value = false

  try {
    const res = await $fetch<any>('/api/alimentos', {
      query: { pagina, busca: buscaDebounce.value },
    })

    produtos.value      = res.produtos || []
    paginaAtual.value   = res.pagina   || 1
    totalPaginas.value  = res.totalPaginas || 1
    totalProdutos.value = res.total    || 0
    cacheCompleto.value = res.cacheCompleto ?? true

    if (!cacheCompleto.value) iniciarPolling()
    else pararPolling()

    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    console.error(e)
    erro.value = true
  } finally {
    carregando.value = false
  }
}

// ===================== DEBOUNCE BUSCA =====================

watch(busca, (valor) => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(async () => {
    buscaDebounce.value = valor
    paginaAtual.value = 1
    await buscarProdutos(1)
  }, 350)
})

// ===================== PAGINAÇÃO =====================

async function irParaPagina(p: number) {
  if (p < 1 || p > totalPaginas.value || p === paginaAtual.value) return
  await buscarProdutos(p)
}

const paginasVisiveis = computed(() => {
  const total = totalPaginas.value
  const atual = paginaAtual.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const inicio = Math.max(2, atual - 2)
  const fim    = Math.min(total - 1, atual + 2)
  const paginas: (number | '...')[] = [1]

  if (inicio > 2) paginas.push('...')
  for (let i = inicio; i <= fim; i++) paginas.push(i)
  if (fim < total - 1) paginas.push('...')
  paginas.push(total)

  return paginas
})

// ===================== POLLING =====================
// Busca atualizações a cada 1.5s enquanto o cache do servidor ainda está construindo.
// Quando o total aumenta, atualiza o contador visível sem recarregar o grid atual.
// Quando o cache fica completo, para o polling automaticamente.

function iniciarPolling() {
  if (pollingTimer) return
  pollingTimer = setInterval(async () => {
    try {
      const res = await $fetch<any>('/api/alimentos', {
        query: { pagina: paginaAtual.value, busca: buscaDebounce.value },
      })

      const totalNovo = res.total || 0

      // Atualiza o contador e repagina sem piscar o grid
      if (totalNovo > totalProdutos.value) {
        totalProdutos.value = totalNovo
        totalPaginas.value  = res.totalPaginas || 1

        // Se estiver na página 1 e chegaram novos produtos, atualiza o grid silenciosamente
        if (paginaAtual.value === 1 && res.produtos?.length > produtos.value.length) {
          produtos.value = res.produtos
        }
      }

      cacheCompleto.value = res.cacheCompleto ?? true
      if (cacheCompleto.value) pararPolling()
    } catch { /* silencioso */ }
  }, 1500)
}

function pararPolling() {
  if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null }
}

// ===================== MODAL =====================

function abrirModal(produto: Produto) { modalProduto.value = { ...produto } }
function fecharModal() { modalProduto.value = null }

function aumentar(id: string) {
  const p = produtos.value.find((p) => p.id === id)
  if (p) p.quantidade = Math.min(p.quantidade + 1, 99)
  if (modalProduto.value?.id === id) modalProduto.value.quantidade = Math.min(modalProduto.value.quantidade + 1, 99)
}
function diminuir(id: string) {
  const p = produtos.value.find((p) => p.id === id)
  if (p && p.quantidade > 1) p.quantidade--
  if (modalProduto.value?.id === id && modalProduto.value.quantidade > 1) modalProduto.value.quantidade--
}
function adicionarDoModal() {
  if (!modalProduto.value) return
  adicionarCarrinho(modalProduto.value, modalProduto.value.quantidade)
  fecharModal()
}

// ===================== SCROLL =====================

function scrollTopo() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
function onScroll()   { mostrarTopo.value = window.scrollY > 600 }

// ===================== IMAGEM =====================

function imgSrc(url: string | undefined | null) {
  return url?.trim() ? url : FALLBACK
}
function imagemErro(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.src !== window.location.origin + FALLBACK) img.src = FALLBACK
}

// ===================== INIT =====================
// ⚠️ SEM await aqui — a página renderiza imediatamente com skeleton,
// os produtos aparecem assim que a API responder (~1-2s)

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  buscarProdutos(1)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (timeoutBusca) clearTimeout(timeoutBusca)
  pararPolling()
})
</script>

<template>
  <div class="min-h-screen bg-[#F2F3F5] flex flex-col font-sans">
    <HeaderMain />

    <!-- ===== HERO ===== -->
    <div class="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-4 py-10 text-white">
      <div
        class="pointer-events-none absolute inset-0 opacity-10"
        style="background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);background-size:20px 20px;"
      />

      <div class="relative mx-auto max-w-5xl text-center">
        <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur-sm">
          <Flame :size="14" />
          Alô Pará Supermercado
        </div>
        <h1 class="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
          Alimentos & Mercearia
        </h1>
        <p class="mt-2 text-white/80 text-base md:text-lg flex items-center justify-center gap-2">
          <template v-if="totalProdutos > 0">
            {{ totalProdutos.toLocaleString('pt-BR') }} produtos disponíveis
            <span v-if="!cacheCompleto" class="inline-flex items-center gap-1 text-sm text-white/60">
              <RefreshCw :size="12" class="animate-spin" />
              carregando mais...
            </span>
          </template>
          <template v-else-if="carregando">
            <RefreshCw :size="14" class="animate-spin opacity-70" />
            Carregando catálogo...
          </template>
          <template v-else>Catálogo disponível</template>
        </p>

        <!-- BUSCA -->
        <div class="mx-auto mt-7 max-w-2xl">
          <div class="relative">
            <Search class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
            <input
              v-model="busca"
              type="text"
              placeholder="Buscar produtos, marcas, categorias..."
              class="h-14 w-full rounded-2xl border-0 bg-white pl-14 pr-14 text-gray-800 shadow-xl outline-none ring-0 placeholder:text-gray-400 focus:ring-2 focus:ring-red-300 transition text-base"
            />
            <button
              v-if="busca"
              @click="busca = ''"
              class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-700 transition"
            >
              <X :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== ERRO ===== -->
    <div v-if="erro" class="flex flex-1 items-center justify-center py-32">
      <div class="text-center">
        <p class="text-5xl">😕</p>
        <h2 class="mt-4 text-xl font-bold text-gray-700">Erro ao carregar produtos</h2>
        <p class="mt-1 text-gray-500">Verifique sua conexão e tente novamente.</p>
        <button
          @click="buscarProdutos(1)"
          class="mt-6 rounded-xl bg-red-500 px-6 py-3 text-white font-bold hover:bg-red-600 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <template v-else>

      <!-- ===== SKELETON LOADING ===== -->
      <div v-if="carregando" class="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">
        <!-- Barra de status skeleton -->
        <div class="mb-4 flex items-center justify-between">
          <div class="h-4 w-48 rounded bg-gray-200 animate-pulse" />
          <div class="h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
        <!-- Grid skeleton com animação em onda (stagger via style) -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
          <div
            v-for="n in 40"
            :key="n"
            class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100"
            :style="{ animationDelay: `${(n - 1) * 30}ms` }"
          >
            <div class="h-36 bg-gray-100 animate-pulse" />
            <div class="p-3 flex flex-col gap-2">
              <div class="h-3 rounded bg-gray-200 animate-pulse w-full" />
              <div class="h-3 rounded bg-gray-200 animate-pulse w-3/4" />
              <div class="h-5 rounded bg-gray-200 animate-pulse w-1/2 mt-1" />
              <div class="h-8 rounded-xl bg-gray-100 animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </div>

      <!-- ===== GRID DE PRODUTOS ===== -->
      <div v-else class="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">

        <!-- Cabeçalho da listagem -->
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-gray-500 flex items-center gap-2">
            <span class="font-semibold text-gray-800">{{ totalProdutos.toLocaleString('pt-BR') }}</span>
            produtos
            <template v-if="busca"> para "<span class="text-red-500">{{ busca }}</span>"</template>
            <span
              v-if="!cacheCompleto"
              class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] text-orange-600 font-medium"
            >
              <RefreshCw :size="10" class="animate-spin" />
              atualizando
            </span>
          </p>
          <p class="text-sm text-gray-400">
            Página {{ paginaAtual }} de {{ totalPaginas }}
          </p>
        </div>

        <!-- Sem resultado -->
        <div v-if="produtos.length === 0" class="flex flex-col items-center py-24 text-gray-400">
          <Search :size="48" class="mb-4 opacity-30" />
          <p class="text-lg font-medium">Nenhum produto encontrado</p>
          <p class="mt-1 text-sm">Tente outro termo de busca</p>
        </div>

        <!-- Grid -->
        <div
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4"
        >
          <div
            v-for="produto in produtos"
            :key="produto.id"
            @click="abrirModal(produto)"
            class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn"
          >
            <div class="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Flame :size="9" />
              Top
            </div>
            <button
              @click.stop="adicionarCarrinho(produto, 1)"
              class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold shadow hover:bg-green-600 active:scale-95 transition-all"
            >+</button>

            <div class="flex h-36 items-center justify-center bg-slate-50 p-3 group-hover:bg-red-50 transition-colors duration-200">
              <img
                :src="imgSrc(produto.img)"
                :alt="produto.nome"
                loading="lazy"
                decoding="async"
                @error="imagemErro"
                class="h-28 w-28 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <div class="flex flex-1 flex-col gap-1 p-3 pt-2">
              <p class="line-clamp-2 min-h-[2.5rem] text-[12px] font-medium leading-snug text-gray-700 md:text-[13px]">
                {{ produto.nome }}
              </p>
              <div class="mt-auto pt-1">
                <span class="text-xl font-extrabold text-green-600 md:text-2xl">
                  R$ {{ produto.preco2 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== PAGINAÇÃO ===== -->
        <div v-if="totalPaginas > 1" class="mt-10 flex flex-col items-center gap-3">

          <div v-if="!cacheCompleto" class="flex items-center gap-2 text-xs text-orange-500 mb-1">
            <RefreshCw :size="11" class="animate-spin" />
            Catálogo carregando em segundo plano — total pode aumentar
          </div>

          <div class="flex items-center gap-1">
            <!-- Anterior -->
            <button
              @click="irParaPagina(paginaAtual - 1)"
              :disabled="paginaAtual === 1"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft :size="16" />
            </button>

            <!-- Números -->
            <template v-for="(p, idx) in paginasVisiveis" :key="idx">
              <span
                v-if="p === '...'"
                class="flex h-9 w-9 items-center justify-center text-gray-400 text-sm select-none"
              >…</span>
              <button
                v-else
                @click="irParaPagina(p as number)"
                :class="[
                  'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition',
                  p === paginaAtual
                    ? 'bg-red-500 text-white shadow'
                    : 'border border-gray-200 bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                ]"
              >{{ p }}</button>
            </template>

            <!-- Próxima -->
            <button
              @click="irParaPagina(paginaAtual + 1)"
              :disabled="paginaAtual === totalPaginas"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <p class="text-xs text-gray-400">
            {{ ((paginaAtual - 1) * 40 + 1).toLocaleString('pt-BR') }}
            –
            {{ Math.min(paginaAtual * 40, totalProdutos).toLocaleString('pt-BR') }}
            de
            {{ totalProdutos.toLocaleString('pt-BR') }} produtos
          </p>
        </div>
      </div>
    </template>

    <!-- ===== MODAL ===== -->
    <Transition name="modal">
      <div
        v-if="modalProduto"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click.self="fecharModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fecharModal" />

        <div class="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl md:rounded-3xl bg-[#111] shadow-2xl">
          <div class="flex items-center justify-center bg-white h-60 p-6 relative">
            <button
              @click="fecharModal"
              class="absolute top-4 right-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition"
            >
              <X :size="18" />
            </button>
            <img
              :src="imgSrc(modalProduto.img)"
              :alt="modalProduto.nome"
              @error="imagemErro"
              class="h-48 object-contain drop-shadow-lg"
            />
          </div>

          <div class="px-8 py-6">
            <span class="text-xs text-gray-400 uppercase tracking-widest">{{ modalProduto.tipo }}</span>
            <h2 class="mt-1 text-xl font-semibold text-white leading-snug">{{ modalProduto.nome }}</h2>
            <p class="mt-2 text-4xl font-extrabold text-green-400">R$ {{ modalProduto.preco2 }}</p>

            <div class="mt-6 flex items-center gap-3">
              <div class="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
                <button @click="diminuir(modalProduto.id)" class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition">−</button>
                <span class="min-w-[2rem] text-center font-bold text-white text-lg">{{ modalProduto.quantidade }}</span>
                <button @click="aumentar(modalProduto.id)" class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition">+</button>
              </div>

              <button
                @click="adicionarDoModal"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-white font-bold text-base hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/30"
              >
                <ShoppingCart :size="18" />
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ===== BOTÃO TOPO ===== -->
    <Transition name="fade">
      <button
        v-if="mostrarTopo"
        @click="scrollTopo"
        class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-xl hover:bg-red-600 active:scale-90 transition-all"
      >
        <ChevronUp :size="22" />
      </button>
    </Transition>

    <Footer />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32,0.72,0,1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(40px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.8); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease both;
}
</style>