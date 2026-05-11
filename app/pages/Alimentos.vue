<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import Footer from '~/components/Layout/Footer.vue'
import {
  Flame, ShoppingBasket, Search, X, ChevronUp,
  SlidersHorizontal, ShoppingCart
} from 'lucide-vue-next'

// ===================== TYPES =====================

type Produto = {
  id: string
  nome: string
  preco: number
  preço2: string
  tipo: string
  img: string
  quantidade: number
}

// ===================== STATE =====================

const { adicionarCarrinho } = useCarrinho()

const produtos      = ref<Produto[]>([])
const carregando    = ref(false)
const carregandoMais = ref(false)
const erro          = ref(false)

const paginaAtual   = ref(1)
const totalPaginas  = ref(1)
const totalProdutos = ref(0)

const busca         = ref('')
const buscaDebounce = ref('')
const modalProduto  = ref<Produto | null>(null)
const mostrarTopo   = ref(false)

let timeoutBusca: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

// ===================== DEBOUNCE DE BUSCA =====================

watch(busca, (valor) => {
  if (timeoutBusca) clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(async () => {
    buscaDebounce.value = valor
    paginaAtual.value = 1
    produtos.value = []
    await buscarProdutos(1, false)
  }, 350)
})

// ===================== FETCH =====================

async function buscarProdutos(pagina = 1, append = false) {
  if (append) carregandoMais.value = true
  else carregando.value = true
  erro.value = false

  try {
    const res = await $fetch<any>('/api/alimentos', {
      query: { pagina, busca: buscaDebounce.value },
    })

    const novos: Produto[] = res.produtos || []

    if (append) {
      // Deduplicação via Set
      const existentes = new Set(produtos.value.map((p) => p.id))
      produtos.value.push(...novos.filter((p) => !existentes.has(p.id)))
    } else {
      produtos.value = novos
    }

    paginaAtual.value   = res.pagina || 1
    totalPaginas.value  = res.totalPaginas || 1
    totalProdutos.value = res.total || 0
  } catch (e) {
    console.error(e)
    if (pagina === 1) erro.value = true
  } finally {
    carregando.value     = false
    carregandoMais.value = false
  }
}

async function carregarMais() {
  if (carregandoMais.value || paginaAtual.value >= totalPaginas.value) return
  await buscarProdutos(paginaAtual.value + 1, true)
}

// ===================== QUANTIDADE =====================

function aumentar(id: string) {
  const p = produtos.value.find((p) => p.id === id)
  if (p) p.quantidade = Math.min(p.quantidade + 1, 99)
}

function diminuir(id: string) {
  const p = produtos.value.find((p) => p.id === id)
  if (p && p.quantidade > 1) p.quantidade--
}

function abrirModal(produto: Produto) {
  modalProduto.value = { ...produto }
}

function fecharModal() {
  modalProduto.value = null
}

function adicionarDoModal() {
  if (!modalProduto.value) return
  adicionarCarrinho(modalProduto.value, modalProduto.value.quantidade)
  fecharModal()
}

// ===================== SCROLL PARA TOPO =====================

function scrollTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onScroll() {
  mostrarTopo.value = window.scrollY > 600
}

// ===================== INFINITE SCROLL =====================

function initObserver() {
  const el = document.getElementById('sentinel')
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) carregarMais()
    },
    { rootMargin: '400px' } // pré-carrega antes do fim
  )
  observer.observe(el)
}

// ===================== INIT =====================

await buscarProdutos(1)

onMounted(() => {
  initObserver()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('scroll', onScroll)
  if (timeoutBusca) clearTimeout(timeoutBusca)
})

// ===================== COMPUTED =====================

const progresso = computed(() =>
  totalPaginas.value > 0
    ? Math.round((paginaAtual.value / totalPaginas.value) * 100)
    : 0
)

const imagemErro = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/sem-imagem.png'
}
</script>

<template>
  <div class="min-h-screen bg-[#F2F3F5] flex flex-col font-sans">
    <HeaderMain />

    <!-- ===== HERO ===== -->
    <div class="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 px-4 py-10 text-white">
      <!-- padrão de fundo decorativo -->
      <div class="pointer-events-none absolute inset-0 opacity-10"
           style="background-image: repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%); background-size: 20px 20px;" />

      <div class="relative mx-auto max-w-5xl text-center">
        <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold backdrop-blur-sm">
          <Flame :size="14" />
          Alô Pará Supermercado
        </div>

        <h1 class="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
          Alimentos & Mercearia
        </h1>
        <p class="mt-2 text-white/80 text-base md:text-lg">
          {{ totalProdutos > 0 ? totalProdutos.toLocaleString('pt-BR') + ' produtos disponíveis' : 'Carregando catálogo...' }}
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
      <!-- ===== LOADING INICIAL ===== -->
      <div v-if="carregando" class="flex flex-1 flex-col items-center justify-center py-32 gap-4">
        <div class="h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        <p class="text-gray-500 text-base">Carregando catálogo completo...</p>
      </div>

      <!-- ===== GRID DE PRODUTOS ===== -->
      <div v-else class="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">

        <!-- contador + info -->
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            <span class="font-semibold text-gray-800">{{ produtos.length.toLocaleString('pt-BR') }}</span>
            produtos carregados
            <template v-if="busca"> para "<span class="text-red-500">{{ busca }}</span>"</template>
          </p>

          <!-- barra de progresso de carga -->
          <div v-if="totalPaginas > 1" class="hidden md:flex items-center gap-3 text-xs text-gray-400">
            <span>Página {{ paginaAtual }}/{{ totalPaginas }}</span>
            <div class="w-28 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-red-500 rounded-full transition-all duration-500"
                :style="{ width: progresso + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- sem resultado -->
        <div
          v-if="produtos.length === 0 && !carregando"
          class="flex flex-col items-center py-24 text-gray-400"
        >
          <Search :size="48" class="mb-4 opacity-30" />
          <p class="text-lg font-medium">Nenhum produto encontrado</p>
          <p class="mt-1 text-sm">Tente outro termo de busca</p>
        </div>

        <!-- grid -->
        <div
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4"
        >
          <div
            v-for="produto in produtos"
            :key="produto.id"
            @click="abrirModal(produto)"
            class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <!-- badge mais vendido -->
            <div class="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              <Flame :size="9" />
              Top
            </div>

            <!-- botão + rápido -->
            <button
              @click.stop="adicionarCarrinho(produto, 1)"
              class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold shadow hover:bg-green-600 active:scale-95 transition-all"
            >
              +
            </button>

            <!-- imagem -->
            <div class="flex h-36 items-center justify-center bg-slate-50 p-3 group-hover:bg-red-50 transition-colors duration-200">
              <img
                :src="produto.img || '/sem-imagem.png'"
                :alt="produto.nome"
                loading="lazy"
                decoding="async"
                @error="imagemErro"
                class="h-28 w-28 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <!-- info -->
            <div class="flex flex-1 flex-col gap-1 p-3 pt-2">
              <p class="line-clamp-2 min-h-[2.5rem] text-[12px] font-medium leading-snug text-gray-700 md:text-[13px]">
                {{ produto.nome }}
              </p>
              <div class="mt-auto pt-1">
                <span class="text-xl font-extrabold text-green-600 md:text-2xl">
                  R$ {{ produto.preço2 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- loading mais -->
        <div v-if="carregandoMais" class="mt-8 flex justify-center">
          <div class="flex items-center gap-3 text-gray-500">
            <div class="h-5 w-5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
            <span class="text-sm">Carregando mais produtos...</span>
          </div>
        </div>

        <!-- sentinela do infinite scroll -->
        <div id="sentinel" class="h-10 mt-4" />
      </div>
    </template>

    <!-- ===== MODAL ===== -->
    <Transition name="modal">
      <div
        v-if="modalProduto"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click.self="fecharModal"
      >
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fecharModal" />

        <!-- painel -->
        <div class="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl md:rounded-3xl bg-[#111] shadow-2xl">
          <!-- imagem -->
          <div class="flex items-center justify-center bg-white h-60 p-6 relative">
            <button
              @click="fecharModal"
              class="absolute top-4 right-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition"
            >
              <X :size="18" />
            </button>
            <img
              :src="modalProduto.img || '/sem-imagem.png'"
              :alt="modalProduto.nome"
              @error="imagemErro"
              class="h-48 object-contain drop-shadow-lg"
            />
          </div>

          <!-- detalhes -->
          <div class="px-8 py-6">
            <span class="text-xs text-gray-400 uppercase tracking-widest">{{ modalProduto.tipo }}</span>
            <h2 class="mt-1 text-xl font-semibold text-white leading-snug">{{ modalProduto.nome }}</h2>
            <p class="mt-2 text-4xl font-extrabold text-green-400">
              R$ {{ modalProduto.preço2 }}
            </p>

            <!-- controle de quantidade -->
            <div class="mt-6 flex items-center gap-3">
              <div class="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
                <button
                  @click="diminuir(modalProduto.id)"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                >
                  −
                </button>
                <span class="min-w-[2rem] text-center font-bold text-white text-lg">
                  {{ modalProduto.quantidade }}
                </span>
                <button
                  @click="aumentar(modalProduto.id)"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                >
                  +
                </button>
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

    <!-- ===== BOTÃO VOLTAR AO TOPO ===== -->
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
/* Modal entra de baixo em mobile */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative {
  transform: translateY(40px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>