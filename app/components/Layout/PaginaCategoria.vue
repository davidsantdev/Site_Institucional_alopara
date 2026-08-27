<script setup lang="ts">
/**
 * Página de categoria — o corpo compartilhado de Alimentos, Bebidas, Limpeza
 * e Perfumaria, que antes eram 4 arquivos de ~500 linhas quase idênticos.
 *
 * O tema vem por props com strings de classe completas (e não montadas em
 * tempo de execução), para que o Tailwind consiga enxergá-las no scanner.
 */
import type { Ordenacao, Produto } from '~/composables/useCatalogo'
import { ChevronLeft, ChevronRight, ChevronUp, ListFilter, RefreshCw, Search, ShoppingCart, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { imagemErro, imgSrc, OPCOES_ORDENACAO, percentualDesconto, useCatalogo } from '~/composables/useCatalogo'
import { useCarrinho } from '~/data/composable/UseCarrinho'

const props = defineProps<{
  endpoint: string
  titulo: string
  descricao?: string
  /** Classes completas do tema. Ex.: 'from-red-600 via-red-500 to-orange-500' */
  gradiente: string
  ring: string
  botao: string
  texto: string
  badge: string
  hoverCard: string
}>()

const { adicionarCarrinho } = useCarrinho()

const {
  produtos,
  carregando,
  erro,
  paginaAtual,
  totalPaginas,
  totalProdutos,
  cacheCompleto,
  busca,
  paginasVisiveis,
  intervaloExibido,
  carregar,
  irParaPagina,
  tipoSelecionado,
  ordenacao,
  tiposDisponiveis,
  filtrosAtivos,
  selecionarTipo,
  definirOrdenacao,
  limparFiltros,
} = useCatalogo(props.endpoint)

const tituloPagina = `${props.titulo} | Alô Pará`
const descricaoPagina = props.descricao ?? `${props.titulo} no Supermercado Alô Pará, em Novo Repartimento - PA.`

useSeoMeta({
  title: tituloPagina,
  description: descricaoPagina,
  ogTitle: tituloPagina,
  ogDescription: descricaoPagina,
})

// ═════════════ MODAL ═════════════

const modalProduto = ref<Produto | null>(null)

function abrirModal(produto: Produto) {
  modalProduto.value = { ...produto }
}
function fecharModal() {
  modalProduto.value = null
}

function aumentar() {
  if (modalProduto.value)
    modalProduto.value.quantidade = Math.min(modalProduto.value.quantidade + 1, 99)
}
function diminuir() {
  if (modalProduto.value && modalProduto.value.quantidade > 1)
    modalProduto.value.quantidade--
}
function adicionarDoModal() {
  if (!modalProduto.value)
    return
  adicionarCarrinho(modalProduto.value, modalProduto.value.quantidade)
  fecharModal()
}

// ═════════════ FILTROS ═════════════

function aoMudarOrdenacao(e: Event) {
  definirOrdenacao((e.target as HTMLSelectElement).value as Ordenacao)
}

// ═════════════ SCROLL / TECLADO ═════════════

const mostrarTopo = ref(false)

function onScroll() {
  mostrarTopo.value = window.scrollY > 600
}
function scrollTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function onTecla(e: KeyboardEvent) {
  if (e.key === 'Escape' && modalProduto.value)
    fecharModal()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onTecla)
  carregar(1, false)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onTecla)
})
</script>

<template>
  <div class="min-h-screen bg-[#111111] flex flex-col font-sans">
    <HeaderMain />

    <!-- ═════ HERO ═════ -->
    <div class="relative overflow-hidden bg-[#111111] px-4 py-12 md:py-16 text-center border-b border-[#1a1a1a]">
      <div
        class="pointer-events-none absolute top-[-180px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br opacity-20 blur-3xl"
        :class="gradiente"
      />

      <div class="relative mx-auto max-w-3xl">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-br px-4 py-1.5 text-[10px] font-black uppercase tracking-[3px] text-white" :class="gradiente">
          <slot name="icone" />
          Alô Pará Supermercado
        </div>

        <h1 class="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
          {{ titulo }}
        </h1>

        <p class="mt-3 flex items-center justify-center gap-2 text-sm text-[#666] md:text-base">
          <template v-if="totalProdutos > 0">
            {{ totalProdutos.toLocaleString('pt-BR') }} produtos disponíveis
            <span v-if="!cacheCompleto" class="inline-flex items-center gap-1 text-sm text-[#555]">
              <RefreshCw :size="12" class="animate-spin" />
              carregando mais...
            </span>
          </template>
          <template v-else-if="carregando">
            <RefreshCw :size="14" class="animate-spin opacity-70" />
            Carregando catálogo...
          </template>
          <template v-else>
            Catálogo disponível
          </template>
        </p>

        <!-- BUSCA -->
        <div class="mx-auto mt-7 max-w-2xl">
          <div class="relative">
            <Search class="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#555]" :size="20" />
            <input
              v-model="busca"
              type="search"
              :aria-label="`Buscar em ${titulo}`"
              placeholder="Buscar produtos, marcas, categorias..."
              class="h-14 w-full rounded-2xl border border-[#2a2a2a] bg-[#161616] pl-14 pr-14 text-base text-white outline-none ring-0 transition placeholder:text-[#555] focus:ring-2"
              :class="ring"
            >
            <button
              v-if="busca"
              type="button"
              aria-label="Limpar busca"
              class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#555] transition hover:text-white"
              @click="busca = ''"
            >
              <X :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═════ FILTROS ═════ -->
    <!-- Não é sticky: o HeaderMain já ocupa top-0 com altura variável (72px no
         mobile, 150px no desktop) e não há como calcular o offset certo sem JS. -->
    <div v-if="!erro" class="border-b border-[#1a1a1a] bg-[#111111]">
      <div class="mx-auto flex w-full max-w-7xl flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <!-- Chips de subcategoria -->
        <div
          v-if="tiposDisponiveis.length"
          class="-mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            class="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
            :class="tipoSelecionado === null ? `${botao} text-white shadow-sm` : 'border border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a] hover:text-white'"
            @click="selecionarTipo(null)"
          >
            Todos
          </button>
          <button
            v-for="faceta in tiposDisponiveis"
            :key="faceta.tipo"
            type="button"
            class="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
            :class="tipoSelecionado === faceta.tipo ? `${botao} text-white shadow-sm` : 'border border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a] hover:text-white'"
            @click="selecionarTipo(faceta.tipo)"
          >
            {{ faceta.tipo }} <span class="opacity-60">({{ faceta.total }})</span>
          </button>
        </div>
        <div v-else class="h-7.5" />

        <!-- Ordenação + limpar -->
        <div class="flex shrink-0 items-center justify-end gap-2">
          <div class="relative">
            <ListFilter class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" :size="13" />
            <select
              id="ordenar"
              aria-label="Ordenar por"
              class="h-9 appearance-none rounded-lg border border-[#2a2a2a] bg-[#161616] py-0 pl-7 pr-3 text-xs font-semibold text-[#ccc] outline-none transition focus:ring-2"
              :class="ring"
              :value="ordenacao"
              @change="aoMudarOrdenacao"
            >
              <option v-for="op in OPCOES_ORDENACAO" :key="op.valor" :value="op.valor">
                {{ op.label }}
              </option>
            </select>
          </div>

          <button
            v-if="filtrosAtivos"
            type="button"
            class="flex h-9 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[#666] transition hover:bg-[#1a1a1a] hover:text-white"
            @click="limparFiltros"
          >
            <X :size="13" />
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- ═════ ERRO ═════ -->
    <div v-if="erro" class="flex flex-1 items-center justify-center py-32">
      <div class="text-center">
        <p class="text-5xl">
          😕
        </p>
        <h2 class="mt-4 text-xl font-bold text-white">
          Erro ao carregar produtos
        </h2>
        <p class="mt-1 text-[#666]">
          Verifique sua conexão e tente novamente.
        </p>
        <button
          type="button"
          class="mt-6 rounded-xl px-6 py-3 text-white font-bold transition"
          :class="botao"
          @click="carregar(1)"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <template v-else>
      <!-- ═════ SKELETON ═════ -->
      <div v-if="carregando" class="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">
        <div class="mb-4 flex items-center justify-between">
          <div class="h-4 w-48 rounded bg-[#1a1a1a] animate-pulse" />
          <div class="h-4 w-24 rounded bg-[#1a1a1a] animate-pulse" />
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
          <div
            v-for="n in 24"
            :key="n"
            class="flex flex-col overflow-hidden rounded-2xl bg-[#161616] border border-[#1f1f1f]"
          >
            <div class="h-36 bg-[#1a1a1a] animate-pulse" />
            <div class="p-3 flex flex-col gap-2">
              <div class="h-3 rounded bg-[#1f1f1f] animate-pulse w-full" />
              <div class="h-3 rounded bg-[#1f1f1f] animate-pulse w-3/4" />
              <div class="h-5 rounded bg-[#1f1f1f] animate-pulse w-1/2 mt-1" />
              <div class="h-8 rounded-xl bg-[#1a1a1a] animate-pulse mt-2" />
            </div>
          </div>
        </div>
      </div>

      <!-- ═════ GRID ═════ -->
      <div v-else class="mx-auto w-full max-w-7xl px-3 py-6 md:px-6">
        <div class="mb-4 flex items-center justify-between">
          <p class="text-sm text-[#666] flex items-center gap-2">
            <span class="font-semibold text-white">{{ totalProdutos.toLocaleString('pt-BR') }}</span>
            produtos
            <template v-if="busca">
              para "<span :class="texto">{{ busca }}</span>"
            </template>
            <template v-if="tipoSelecionado">
              em <span :class="texto">{{ tipoSelecionado }}</span>
            </template>
            <span
              v-if="!cacheCompleto"
              class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium"
              :class="badge"
            >
              <RefreshCw :size="10" class="animate-spin" />
              atualizando
            </span>
          </p>
          <p class="text-sm text-[#555]">
            Página {{ paginaAtual }} de {{ totalPaginas }}
          </p>
        </div>

        <!-- Sem resultado -->
        <div v-if="produtos.length === 0" class="flex flex-col items-center py-24 text-[#555]">
          <Search :size="48" class="mb-4 opacity-30" />
          <p class="text-lg font-medium text-[#888]">
            Nenhum produto encontrado
          </p>
          <p class="mt-1 text-sm">
            {{ filtrosAtivos ? 'Tente outro termo ou remova alguns filtros' : 'Tente outro termo de busca' }}
          </p>
          <button
            v-if="filtrosAtivos"
            type="button"
            class="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition"
            :class="botao"
            @click="limparFiltros"
          >
            Limpar filtros
          </button>
        </div>

        <div
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4"
        >
          <div
            v-for="produto in produtos"
            :key="produto.id"
            class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#161616] border border-[#1f1f1f] hover:border-[#3a3a3a] hover:-translate-y-0.5 transition-all duration-200 animate-fadeIn"
            @click="abrirModal(produto)"
          >
            <span
              v-if="produto.emPromocao"
              class="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow"
            >
              -{{ percentualDesconto(produto.precoOriginal, produto.preco2) }}%
            </span>

            <button
              type="button"
              :aria-label="`Adicionar ${produto.nome} ao carrinho`"
              class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white text-base font-bold shadow hover:bg-green-600 active:scale-95 transition-all"
              @click.stop="adicionarCarrinho(produto, 1)"
            >
              +
            </button>

            <div class="flex h-36 items-center justify-center bg-[#fafafa] p-3 transition-colors duration-200" :class="hoverCard">
              <img
                :src="imgSrc(produto.img)"
                :alt="produto.nome"
                width="112"
                height="112"
                loading="lazy"
                decoding="async"
                class="h-28 w-28 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                @error="imagemErro"
              >
            </div>

            <div class="flex flex-1 flex-col gap-1 p-3 pt-2">
              <p class="line-clamp-2 min-h-[2.5rem] text-[12px] font-medium leading-snug text-[#ccc] md:text-[13px]">
                {{ produto.nome }}
              </p>
              <div class="mt-auto pt-1">
                <span v-if="produto.emPromocao" class="block text-xs font-medium text-[#666] line-through">
                  R$ {{ produto.precoOriginal }}
                </span>
                <span class="text-xl font-extrabold text-green-400 md:text-2xl">
                  R$ {{ produto.preco2 }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═════ PAGINAÇÃO ═════ -->
        <nav v-if="totalPaginas > 1" class="mt-10 flex flex-col items-center gap-3" aria-label="Paginação">
          <div class="flex items-center gap-1">
            <button
              type="button"
              aria-label="Página anterior"
              :disabled="paginaAtual === 1"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              @click="irParaPagina(paginaAtual - 1)"
            >
              <ChevronLeft :size="16" />
            </button>

            <template v-for="(p, idx) in paginasVisiveis" :key="idx">
              <span
                v-if="p === '...'"
                class="flex h-9 w-9 items-center justify-center text-[#555] text-sm select-none"
              >…</span>
              <button
                v-else
                type="button"
                :aria-current="p === paginaAtual ? 'page' : undefined"
                class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition"
                :class="p === paginaAtual
                  ? `${botao} text-white shadow`
                  : 'border border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a] hover:text-white'"
                @click="irParaPagina(p as number)"
              >
                {{ p }}
              </button>
            </template>

            <button
              type="button"
              aria-label="Próxima página"
              :disabled="paginaAtual === totalPaginas"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              @click="irParaPagina(paginaAtual + 1)"
            >
              <ChevronRight :size="16" />
            </button>
          </div>

          <p class="text-xs text-[#555]">
            {{ intervaloExibido.de.toLocaleString('pt-BR') }}
            –
            {{ intervaloExibido.ate.toLocaleString('pt-BR') }}
            de
            {{ totalProdutos.toLocaleString('pt-BR') }} produtos
          </p>
        </nav>
      </div>
    </template>

    <!-- ═════ MODAL ═════ -->
    <Transition name="modal">
      <div
        v-if="modalProduto"
        role="dialog"
        aria-modal="true"
        class="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        @click.self="fecharModal"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="fecharModal" />

        <div class="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl md:rounded-3xl bg-[#111] border border-[#1f1f1f] shadow-2xl">
          <div class="flex items-center justify-center bg-[#fafafa] h-60 p-6 relative">
            <button
              type="button"
              aria-label="Fechar"
              class="absolute top-4 right-4 rounded-full bg-black/60 border border-[#2a2a2a] p-2 text-[#888] hover:text-white transition"
              @click="fecharModal"
            >
              <X :size="18" />
            </button>
            <img
              :src="imgSrc(modalProduto.img)"
              :alt="modalProduto.nome"
              class="h-48 object-contain drop-shadow-lg"
              @error="imagemErro"
            >
          </div>

          <div class="px-8 py-6">
            <span class="text-xs text-[#555] uppercase tracking-widest">{{ modalProduto.tipo }}</span>
            <h2 class="mt-1 text-xl font-semibold text-white leading-snug">
              {{ modalProduto.nome }}
            </h2>
            <div class="mt-2 flex items-center gap-2">
              <p class="text-4xl font-extrabold text-green-400">
                R$ {{ modalProduto.preco2 }}
              </p>
              <span v-if="modalProduto.emPromocao" class="text-base font-medium text-[#666] line-through">
                R$ {{ modalProduto.precoOriginal }}
              </span>
            </div>

            <div class="mt-6 flex items-center gap-3">
              <div class="flex items-center gap-2 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                  @click="diminuir"
                >
                  −
                </button>
                <span class="min-w-[2rem] text-center font-bold text-white text-lg">{{ modalProduto.quantidade }}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                  @click="aumentar"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-white font-bold text-base hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/30"
                @click="adicionarDoModal"
              >
                <ShoppingCart :size="18" />
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═════ VOLTAR AO TOPO ═════ -->
    <Transition name="fade">
      <button
        v-if="mostrarTopo"
        type="button"
        aria-label="Voltar ao topo"
        class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl active:scale-90 transition-all"
        :class="botao"
        @click="scrollTopo"
      >
        <ChevronUp :size="22" />
      </button>
    </Transition>

    <Footer />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(40px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.8); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.25s ease both; }

@media (prefers-reduced-motion: reduce) {
  .animate-fadeIn { animation: none; }
  .modal-enter-active, .modal-leave-active,
  .modal-enter-active .relative, .modal-leave-active .relative { transition: none; }
}
</style>
