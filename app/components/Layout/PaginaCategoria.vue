<script setup lang="ts">
/**
 * Página de categoria — o corpo compartilhado de Alimentos, Hortifruti,
 * Carnes, Bebidas, Limpeza, Perfumaria, Ofertas e da busca do site.
 *
 * O tema vem por props com strings de classe completas (e não montadas em
 * tempo de execução), para que o Tailwind consiga enxergá-las no scanner.
 */
import type { Ordenacao } from '~/composables/useCatalogo'
import { ArrowUp, ChevronLeft, ChevronRight, ListFilter, RefreshCw, Search, SearchX, X } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import CardProduto from '~/components/Layout/CardProduto.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { OPCOES_ORDENACAO, useCatalogo } from '~/composables/useCatalogo'
import { formatarTipo } from '~/composables/useFormatacao'

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
  /** Página de resultados da busca do site: título vira o termo buscado e fica fora do Google. */
  modoBusca?: boolean
}>()

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
  paginaInicial,
  tipoSelecionado,
  ordenacao,
  tiposDisponiveis,
  filtrosAtivos,
  selecionarTipo,
  definirOrdenacao,
  limparFiltros,
} = useCatalogo(props.endpoint)

const termoBusca = computed(() => busca.value.trim())
const tituloExibido = computed(() => props.modoBusca
  ? (termoBusca.value ? `Resultados para "${termoBusca.value}"` : 'Buscar produtos')
  : props.titulo)

const tituloPagina = computed(() => props.modoBusca
  ? `${termoBusca.value ? `${termoBusca.value} — busca` : 'Busca'} | Alô Pará`
  : `${props.titulo} | Alô Pará`)
const descricaoPagina = props.descricao ?? `${props.titulo} no Supermercado Alô Pará, em Novo Repartimento - PA.`

useSeoMeta({
  title: tituloPagina,
  description: descricaoPagina,
  ogTitle: tituloPagina,
  ogDescription: descricaoPagina,
  // Página de resultado de busca é conteúdo "fino" e infinito pro Google — fica de fora.
  robots: props.modoBusca ? 'noindex, follow' : undefined,
})

// ═════════════ FILTROS ═════════════

function aoMudarOrdenacao(e: Event) {
  definirOrdenacao((e.target as HTMLSelectElement).value as Ordenacao)
}

// ═════════════ SCROLL ═════════════

const mostrarTopo = ref(false)

function onScroll() {
  mostrarTopo.value = window.scrollY > 900
}
function scrollTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })

  // Voltou da página de um produto pelo "voltar"? O vue-router guarda a rolagem
  // de quando a pessoa saiu (e `forward` só existe nesse caso). Lido ANTES da
  // primeira carga, que mexe na URL. A lista chega depois do primeiro paint,
  // então a rolagem só dá pra restaurar quando os cards já estão na tela.
  const estadoNavegacao = window.history.state
  const rolagemSalva = estadoNavegacao?.forward ? estadoNavegacao?.scroll : null

  await carregar(paginaInicial, false)

  if (rolagemSalva?.top) {
    await nextTick()
    window.scrollTo(rolagemSalva.left ?? 0, rolagemSalva.top)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-(--bg-pagina) font-sans">
    <HeaderMain />

    <!-- ═════ CABEÇALHO DA CATEGORIA ═════ -->
    <section class="relative overflow-hidden border-b border-(--borda)">
      <div class="pointer-events-none absolute -right-20 -top-40 h-105 w-105 rounded-full bg-linear-to-br opacity-15 blur-3xl" :class="gradiente" />

      <div class="relative mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-9 lg:px-8">
        <nav aria-label="Caminho" class="mb-4 flex items-center gap-1 text-xs text-(--texto-fraco)">
          <NuxtLink to="/" class="transition hover:text-(--texto-primario)">
            Início
          </NuxtLink>
          <ChevronRight :size="12" class="opacity-50" />
          <span class="font-medium text-(--texto-secundario)" aria-current="page">{{ modoBusca ? 'Busca' : titulo }}</span>
        </nav>

        <div class="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div class="flex items-center gap-4">
            <span
              class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-white shadow-lg md:h-16 md:w-16 [&_svg]:h-7 [&_svg]:w-7"
              :class="gradiente"
            >
              <Search v-if="modoBusca" />
              <slot v-else name="icone" />
            </span>
            <div class="min-w-0">
              <h1 class="text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-4xl">
                {{ tituloExibido }}
              </h1>
              <p class="mt-1 flex items-center gap-2 text-sm text-(--texto-fraco) md:text-base">
                <template v-if="totalProdutos > 0">
                  <span><strong class="numeros font-semibold text-(--texto-secundario)">{{ totalProdutos.toLocaleString('pt-BR') }}</strong> {{ totalProdutos === 1 ? 'produto' : 'produtos' }}</span>
                  <span v-if="!cacheCompleto" class="inline-flex items-center gap-1 text-xs">
                    <RefreshCw :size="12" class="animate-spin" />
                    atualizando
                  </span>
                </template>
                <template v-else-if="carregando">
                  <RefreshCw :size="14" class="animate-spin opacity-70" />
                  Carregando produtos...
                </template>
                <template v-else-if="!modoBusca">
                  Catálogo disponível
                </template>
              </p>
            </div>
          </div>

          <!-- Busca dentro da categoria (a do header busca no site inteiro) -->
          <div v-if="!modoBusca" class="relative w-full md:max-w-sm">
            <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--texto-suave)" :size="17" />
            <input
              v-model="busca"
              type="search"
              :aria-label="`Buscar em ${titulo}`"
              :placeholder="`Buscar em ${titulo}`"
              class="h-11 w-full rounded-full border border-(--borda-forte) bg-(--bg-cartao) pl-11 pr-10 text-[15px] text-(--texto-primario) shadow-(--sombra-1) outline-none transition placeholder:text-(--texto-suave) focus:ring-4 [&::-webkit-search-cancel-button]:hidden"
              :class="ring"
            >
            <button
              v-if="busca"
              type="button"
              aria-label="Limpar busca"
              class="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-(--texto-suave) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
              @click="busca = ''"
            >
              <X :size="16" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═════ FILTROS (grudam embaixo do header) ═════ -->
    <div
      v-if="!erro"
      class="sticky z-30 border-b border-(--borda) bg-(--bg-vidro) backdrop-blur-xl transition-[top] duration-300"
      style="top: var(--altura-header-visivel, 0px)"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 md:px-6 lg:px-8">
        <div class="trilho -mx-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-1 py-0.5">
          <template v-if="tiposDisponiveis.length">
            <button
              type="button"
              class="h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition"
              :class="tipoSelecionado === null ? `${botao} text-white shadow-sm` : 'border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) hover:border-(--borda-hover) hover:text-(--texto-primario)'"
              @click="selecionarTipo(null)"
            >
              Todos
            </button>
            <button
              v-for="faceta in tiposDisponiveis"
              :key="faceta.tipo"
              type="button"
              class="h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition"
              :class="tipoSelecionado === faceta.tipo ? `${botao} text-white shadow-sm` : 'border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) hover:border-(--borda-hover) hover:text-(--texto-primario)'"
              @click="selecionarTipo(faceta.tipo)"
            >
              {{ formatarTipo(faceta.tipo) }} <span class="numeros opacity-60">{{ faceta.total }}</span>
            </button>
          </template>
          <div v-else-if="carregando" class="flex gap-2">
            <div v-for="n in 5" :key="n" class="h-8 w-24 shrink-0 animate-pulse rounded-full bg-(--bg-elevado)" />
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1.5">
          <div class="relative">
            <ListFilter class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--texto-suave)" :size="14" />
            <select
              id="ordenar"
              aria-label="Ordenar por"
              class="h-8 appearance-none rounded-full border border-(--borda-forte) bg-(--bg-cartao) py-0 pl-8 pr-3 text-[13px] font-medium text-(--texto-secundario) outline-none transition hover:border-(--borda-hover) focus:ring-4"
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
            class="hidden h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-(--texto-fraco) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario) sm:flex"
            @click="limparFiltros"
          >
            <X :size="14" />
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- ═════ ERRO ═════ -->
    <div v-if="erro" class="flex flex-1 items-center justify-center px-4 py-28">
      <div class="max-w-sm text-center">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-(--bg-elevado) text-(--texto-fraco)">
          <RefreshCw :size="26" />
        </span>
        <h2 class="mt-5 text-xl font-bold text-(--texto-primario)">
          Não conseguimos carregar os produtos
        </h2>
        <p class="mt-1.5 text-(--texto-fraco)">
          Verifique sua conexão e tente de novo.
        </p>
        <button
          type="button"
          class="mt-6 rounded-full px-6 py-3 font-semibold text-white transition active:scale-[0.97]"
          :class="botao"
          @click="carregar(1)"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <template v-else>
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 lg:px-8">
        <!-- ═════ SKELETON ═════ -->
        <div v-if="carregando" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          <div v-for="n in 18" :key="n" class="rounded-2xl border border-(--borda) bg-(--bg-cartao) p-2.5">
            <div class="aspect-square animate-pulse rounded-xl bg-(--bg-elevado)" />
            <div class="mt-3 h-3 w-full animate-pulse rounded bg-(--bg-elevado)" />
            <div class="mt-2 h-3 w-2/3 animate-pulse rounded bg-(--bg-elevado)" />
            <div class="mt-4 h-6 w-1/2 animate-pulse rounded bg-(--bg-elevado)" />
            <div class="mt-3 h-10 animate-pulse rounded-xl bg-(--bg-elevado)" />
          </div>
        </div>

        <template v-else>
          <div class="mb-4 flex items-center justify-between gap-3 text-sm text-(--texto-fraco)">
            <p class="min-w-0 truncate">
              <template v-if="termoBusca && !modoBusca">
                Resultados para "<span class="font-medium text-(--texto-primario)">{{ termoBusca }}</span>"
              </template>
              <template v-if="tipoSelecionado">
                {{ termoBusca && !modoBusca ? 'em' : 'Mostrando' }} <span class="font-medium text-(--texto-primario)">{{ formatarTipo(tipoSelecionado) }}</span>
              </template>
            </p>
            <p v-if="totalPaginas > 1" class="numeros shrink-0">
              Página {{ paginaAtual }} de {{ totalPaginas }}
            </p>
          </div>

          <!-- Sem resultado -->
          <div v-if="produtos.length === 0" class="flex flex-col items-center px-4 py-20 text-center">
            <span class="grid h-16 w-16 place-items-center rounded-2xl bg-(--bg-elevado) text-(--texto-fraco)">
              <SearchX :size="28" />
            </span>
            <p class="mt-5 text-lg font-semibold text-(--texto-primario)">
              {{ modoBusca && !termoBusca ? 'O que você procura hoje?' : 'Nenhum produto encontrado' }}
            </p>
            <p class="mt-1 max-w-sm text-sm text-(--texto-fraco)">
              {{ modoBusca && !termoBusca
                ? 'Use a busca lá em cima — dá pra procurar por produto, marca ou tipo.'
                : filtrosAtivos ? 'Tente outro termo ou remova alguns filtros.' : 'Tente um termo mais geral.' }}
            </p>
            <button
              v-if="filtrosAtivos && !modoBusca"
              type="button"
              class="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[0.97]"
              :class="botao"
              @click="limparFiltros"
            >
              Limpar filtros
            </button>
          </div>

          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            <CardProduto
              v-for="produto in produtos"
              :key="produto.id"
              :produto="produto"
              :hover-card="hoverCard"
            />
          </div>

          <!-- ═════ PAGINAÇÃO ═════ -->
          <nav v-if="totalPaginas > 1" class="mt-12 flex flex-col items-center gap-3" aria-label="Paginação">
            <div class="flex items-center gap-1">
              <button
                type="button"
                aria-label="Página anterior"
                :disabled="paginaAtual === 1"
                class="grid h-10 w-10 place-items-center rounded-full border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) transition hover:border-(--borda-hover) hover:text-(--texto-primario) disabled:cursor-not-allowed disabled:opacity-30"
                @click="irParaPagina(paginaAtual - 1)"
              >
                <ChevronLeft :size="17" />
              </button>

              <template v-for="(p, idx) in paginasVisiveis" :key="idx">
                <span v-if="p === '...'" class="grid h-10 w-8 select-none place-items-center text-sm text-(--texto-suave)">…</span>
                <button
                  v-else
                  type="button"
                  :aria-current="p === paginaAtual ? 'page' : undefined"
                  class="numeros grid h-10 min-w-10 place-items-center rounded-full px-2 text-sm font-medium transition"
                  :class="p === paginaAtual
                    ? `${botao} text-white shadow-sm`
                    : 'text-(--texto-esmaecido) hover:bg-(--bg-elevado) hover:text-(--texto-primario)'"
                  @click="irParaPagina(p as number)"
                >
                  {{ p }}
                </button>
              </template>

              <button
                type="button"
                aria-label="Próxima página"
                :disabled="paginaAtual === totalPaginas"
                class="grid h-10 w-10 place-items-center rounded-full border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-esmaecido) transition hover:border-(--borda-hover) hover:text-(--texto-primario) disabled:cursor-not-allowed disabled:opacity-30"
                @click="irParaPagina(paginaAtual + 1)"
              >
                <ChevronRight :size="17" />
              </button>
            </div>

            <p class="numeros text-xs text-(--texto-suave)">
              {{ intervaloExibido.de.toLocaleString('pt-BR') }}–{{ intervaloExibido.ate.toLocaleString('pt-BR') }}
              de {{ totalProdutos.toLocaleString('pt-BR') }} produtos
            </p>
          </nav>
        </template>
      </main>
    </template>

    <!-- ═════ VOLTAR AO TOPO ═════ -->
    <Transition name="subir">
      <button
        v-if="mostrarTopo"
        type="button"
        aria-label="Voltar ao topo"
        class="fixed bottom-6 left-1/2 z-40 flex h-10 -translate-x-1/2 items-center gap-1.5 rounded-full border border-(--borda) bg-(--bg-cartao) px-4 text-sm font-medium text-(--texto-primario) shadow-(--sombra-3) transition hover:border-(--borda-forte) active:scale-95"
        @click="scrollTopo"
      >
        <ArrowUp :size="16" />
        Voltar ao topo
      </button>
    </Transition>

    <Footer />
  </div>
</template>

<style scoped>
.subir-enter-active, .subir-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.subir-enter-from, .subir-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
