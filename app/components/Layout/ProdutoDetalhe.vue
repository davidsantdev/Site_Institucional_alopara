<script setup lang="ts">
/**
 * "Aba" de detalhe do produto — abre ao clicar num card. Além de foto, preço e
 * quantidade, mostra "Produtos similares" embaixo (mesma subcategoria,
 * promoção primeiro) pra puxar compra adicional sem a pessoa precisar voltar
 * pra lista. Todas as páginas de categoria e a de Ofertas usam isto (elas
 * dividem o PaginaCategoria).
 */
import type { Produto } from '~/composables/useCatalogo'
import { ArrowLeft, Check, ChevronRight, ShoppingCart } from 'lucide-vue-next'
import { onUnmounted, ref, watch } from 'vue'
import { imagemErro, imgSrc, percentualDesconto } from '~/composables/useCatalogo'
import { useCarrinho } from '~/data/composable/UseCarrinho'

const props = defineProps<{
  produto: Produto | null
  /** Rota da API da categoria — de onde saem os similares (filtra por `tipo`). */
  endpoint: string
  /** Lista já carregada na página — completa os similares quando a subcategoria é pequena. */
  complemento: Produto[]
  /** Classe de cor do tema da categoria (ex.: 'text-red-400'). */
  texto: string
}>()

const emit = defineEmits<{
  (e: 'fechar'): void
  (e: 'verTodos', tipo: string): void
}>()

const MAX_SIMILARES = 12

const { adicionarCarrinho } = useCarrinho()

/** O que está aparecendo agora — começa igual a `produto`, mas troca ao clicar num similar. */
const atual = ref<Produto | null>(null)
const quantidade = ref(1)
const adicionado = ref(false)
const similares = ref<Produto[]>([])
const carregandoSimilares = ref(false)
const painel = ref<HTMLElement | null>(null)

/** Subcategoria → produtos dela. Abrir vários produtos do mesmo tipo não refaz a requisição. */
const cachePorTipo = new Map<string, Produto[]>()
/** Descarta a resposta de uma busca que já foi superada por outro produto aberto. */
let sequencia = 0
let timerAdicionado: ReturnType<typeof setTimeout> | null = null

/** Promoção primeiro — é o que mais puxa compra por impulso. `sort` é estável. */
function promocaoPrimeiro(lista: Produto[]): Produto[] {
  return [...lista].sort((a, b) => Number(b.emPromocao) - Number(a.emPromocao))
}

/** Similares da mesma subcategoria; se sobrar espaço, completa com o que a página já tinha. */
function combinar(doTipo: Produto[], idAtual: string): Produto[] {
  const vistos = new Set<string>([idAtual])
  const semRepetir = (lista: Produto[]) => lista.filter((p) => {
    if (vistos.has(p.id))
      return false
    vistos.add(p.id)
    return true
  })

  const primeiros = promocaoPrimeiro(semRepetir(doTipo))
  const resto = promocaoPrimeiro(semRepetir(props.complemento))
  return [...primeiros, ...resto].slice(0, MAX_SIMILARES)
}

async function carregarSimilares(p: Produto) {
  const minha = ++sequencia

  const emCache = p.tipo ? cachePorTipo.get(p.tipo) : undefined
  // Já mostra o que dá (cache ou o que a página tem) sem esperar a rede.
  similares.value = combinar(emCache ?? [], p.id)
  if (emCache || !p.tipo) {
    carregandoSimilares.value = false
    return
  }

  carregandoSimilares.value = similares.value.length === 0
  try {
    const res = await $fetch<{ produtos?: Produto[] }>(props.endpoint, { query: { tipo: p.tipo, pagina: 1 } })
    if (minha !== sequencia)
      return
    cachePorTipo.set(p.tipo, res.produtos ?? [])
    similares.value = combinar(res.produtos ?? [], p.id)
  }
  catch {
    // Sem a lista de similares o resto da aba funciona igual — fica só o que a página já tinha.
  }
  finally {
    if (minha === sequencia)
      carregandoSimilares.value = false
  }
}

function mostrar(p: Produto | null) {
  atual.value = p ? { ...p } : null
  quantidade.value = 1
  adicionado.value = false
  if (p)
    carregarSimilares(p)
}

watch(() => props.produto, mostrar, { immediate: true })

function abrirSimilar(p: Produto) {
  mostrar(p)
  painel.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function aumentar() {
  quantidade.value = Math.min(quantidade.value + 1, 99)
}
function diminuir() {
  quantidade.value = Math.max(quantidade.value - 1, 1)
}

function adicionar() {
  if (!atual.value)
    return
  // Não fecha a aba de propósito: a graça é a pessoa já poder pegar os similares logo abaixo.
  adicionarCarrinho(atual.value, quantidade.value)
  adicionado.value = true
  if (timerAdicionado)
    clearTimeout(timerAdicionado)
  timerAdicionado = setTimeout(() => {
    adicionado.value = false
  }, 1800)
}

onUnmounted(() => {
  if (timerAdicionado)
    clearTimeout(timerAdicionado)
})
</script>

<template>
  <Transition name="detalhe">
    <div
      v-if="atual"
      role="dialog"
      aria-modal="true"
      :aria-label="atual.nome"
      class="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      @click.self="emit('fechar')"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('fechar')" />

      <div
        ref="painel"
        class="painel relative z-10 max-h-[92vh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-(--borda) bg-(--bg-cartao) shadow-2xl md:max-h-[90vh] md:max-w-2xl md:rounded-3xl"
      >
        <!-- ═════ FOTO ═════ -->
        <!-- Fundo claro fixo: a foto do produto é sempre em fundo branco, até no tema escuro. -->
        <div class="relative bg-[#fafafa] px-6 pb-4 pt-16 md:pt-14">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-700 shadow-sm transition hover:bg-neutral-100 active:scale-95"
            @click="emit('fechar')"
          >
            <ArrowLeft :size="18" />
          </button>

          <span
            v-if="atual.emPromocao"
            class="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow"
          >
            -{{ percentualDesconto(atual.precoOriginal, atual.preco2) }}%
          </span>

          <img
            :key="atual.id"
            :src="imgSrc(atual.img)"
            :alt="atual.nome"
            class="foto mx-auto h-48 object-contain drop-shadow-lg md:h-60"
            @error="imagemErro"
          >
        </div>

        <!-- ═════ INFO + COMPRA ═════ -->
        <div class="px-6 pt-5 md:px-8">
          <span class="text-[11px] font-bold uppercase tracking-widest" :class="texto">{{ atual.tipo }}</span>
          <h2 class="mt-1 text-2xl font-black leading-tight text-(--texto-primario) md:text-3xl">
            {{ atual.nome }}
          </h2>

          <div class="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <template v-if="atual.emPromocao">
                <p class="text-sm text-(--texto-fraco)">
                  Preço normal: <span class="line-through">R$ {{ atual.precoOriginal }}</span>
                </p>
                <span class="block text-[11px] font-black uppercase tracking-wide text-emerald-500">Preço do clube</span>
              </template>
              <p class="text-4xl font-extrabold text-(--preco)">
                R$ {{ atual.preco2 }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 rounded-xl border border-(--borda-forte) bg-(--bg-elevado) p-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-(--texto-primario) transition hover:bg-(--borda-forte)"
                  @click="diminuir"
                >
                  −
                </button>
                <span class="min-w-8 text-center text-lg font-bold text-(--texto-primario)">{{ quantidade }}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-(--texto-primario) transition hover:bg-(--borda-forte)"
                  @click="aumentar"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-bold text-white shadow-lg transition-all active:scale-95 sm:flex-none"
                :class="adicionado ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-red-600 shadow-red-900/30 hover:bg-red-700'"
                @click="adicionar"
              >
                <component :is="adicionado ? Check : ShoppingCart" :size="18" />
                {{ adicionado ? 'Adicionado' : 'Adicionar ao carrinho' }}
              </button>
            </div>
          </div>
        </div>

        <!-- ═════ SIMILARES ═════ -->
        <section
          v-if="carregandoSimilares || similares.length"
          aria-label="Produtos similares"
          class="mt-6 border-t border-(--borda) py-5"
        >
          <div class="mb-3 flex items-center justify-between px-6 md:px-8">
            <h3 class="text-lg font-black tracking-tight text-(--texto-primario)">
              Produtos similares
            </h3>
            <button
              v-if="atual.tipo"
              type="button"
              class="flex items-center gap-0.5 text-xs font-bold transition hover:underline"
              :class="texto"
              @click="emit('verTodos', atual.tipo)"
            >
              ver todos
              <ChevronRight :size="14" />
            </button>
          </div>

          <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <template v-if="carregandoSimilares && !similares.length">
              <div
                v-for="n in 4"
                :key="n"
                class="w-36 shrink-0 rounded-2xl border border-(--borda) p-2.5"
              >
                <div class="h-24 animate-pulse rounded-xl bg-(--bg-elevado)" />
                <div class="mt-2 h-3 w-full animate-pulse rounded bg-(--borda)" />
                <div class="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-(--borda)" />
                <div class="mt-3 h-5 w-1/2 animate-pulse rounded bg-(--borda)" />
              </div>
            </template>

            <article
              v-for="s in similares"
              :key="s.id"
              class="relative w-36 shrink-0 cursor-pointer snap-start rounded-2xl border border-(--borda) bg-(--bg-cartao) p-2.5 transition hover:border-(--borda-hover)"
              @click="abrirSimilar(s)"
            >
              <span
                v-if="s.emPromocao"
                class="absolute left-3.5 top-3.5 z-10 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow"
              >
                -{{ percentualDesconto(s.precoOriginal, s.preco2) }}%
              </span>

              <div class="flex h-24 items-center justify-center rounded-xl bg-[#fafafa]">
                <img
                  :src="imgSrc(s.img)"
                  :alt="s.nome"
                  width="80"
                  height="80"
                  loading="lazy"
                  decoding="async"
                  class="h-20 w-20 object-contain"
                  @error="imagemErro"
                >
              </div>

              <p class="mt-2 line-clamp-2 min-h-8 text-[11px] font-medium leading-snug text-(--texto-secundario)">
                {{ s.nome }}
              </p>

              <div class="mt-1.5 flex items-end justify-between gap-1">
                <div class="min-w-0 leading-tight">
                  <p v-if="s.emPromocao" class="text-[10px] text-(--texto-fraco) line-through">
                    R$ {{ s.precoOriginal }}
                  </p>
                  <p class="text-base font-extrabold text-(--preco)">
                    R$ {{ s.preco2 }}
                  </p>
                </div>
                <button
                  type="button"
                  :aria-label="`Adicionar ${s.nome} ao carrinho`"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-base font-bold text-white shadow transition hover:bg-green-600 active:scale-95"
                  @click.stop="adicionarCarrinho(s, 1)"
                >
                  +
                </button>
              </div>
            </article>
          </div>
        </section>

        <div v-else class="h-6" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.detalhe-enter-active, .detalhe-leave-active { transition: opacity 0.2s ease; }
.detalhe-enter-active .painel, .detalhe-leave-active .painel { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.detalhe-enter-from, .detalhe-leave-to { opacity: 0; }
.detalhe-enter-from .painel { transform: translateY(40px); }

/* Troca de produto (clique num similar): a foto nova entra com um fade curto. */
@keyframes trocarFoto {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
.foto { animation: trocarFoto 0.25s ease both; }

@media (prefers-reduced-motion: reduce) {
  .foto { animation: none; }
  .detalhe-enter-active, .detalhe-leave-active,
  .detalhe-enter-active .painel, .detalhe-leave-active .painel { transition: none; }
}
</style>
