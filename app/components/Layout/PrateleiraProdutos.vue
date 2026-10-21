<script setup lang="ts">
/**
 * Prateleira horizontal de produtos da home (ofertas, hortifruti, carnes...).
 *
 * - Só busca quando chega perto da tela — a home tem várias, e quem não rola
 *   até o fim não precisa baixar todas.
 * - `/` é pré-renderizada no build: a busca é sempre no navegador (nada de
 *   preço congelado no HTML do deploy).
 * - Vitrine é curadoria: só produto com foto (ou emoji, no hortifruti e no
 *   açougue) quando há o bastante, e no máximo 2 do mesmo tipo — senão a
 *   ordem "arroz/feijão/macarrão primeiro" enchia a prateleira de 7
 *   macarrões instantâneos seguidos.
 */
import type { Produto } from '~/composables/useCatalogo'
import { useIntersectionObserver } from '@vueuse/core'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { nextTick, onMounted, ref, watch } from 'vue'
import CardProduto from '~/components/Layout/CardProduto.vue'

const props = withDefaults(defineProps<{
  titulo: string
  subtitulo?: string
  endpoint: string
  /** "Ver tudo" — a página completa da categoria. */
  link: string
  limite?: number
  hoverCard?: string
}>(), {
  limite: 16,
  hoverCard: '',
})

const MAX_POR_TIPO = 2

const raiz = ref<HTMLElement | null>(null)
const trilho = ref<HTMLElement | null>(null)
const produtos = ref<Produto[]>([])
const estado = ref<'esperando' | 'carregando' | 'pronto' | 'vazio'>('esperando')
const noInicio = ref(true)
const noFim = ref(false)

/** Com pelo menos isto de produtos com foto, os sem foto nem entram na vitrine. */
const MIN_COM_FOTO = 6

function curar(lista: Produto[]): Produto[] {
  const temFoto = (p: Produto) => Boolean(p.imagemReal || p.emoji)
  const comFoto = lista.filter(temFoto)
  const ordenada = comFoto.length >= MIN_COM_FOTO ? comFoto : [...comFoto, ...lista.filter(p => !temFoto(p))]
  const porTipo = new Map<string, number>()
  const escolhidos: Produto[] = []
  const sobras: Produto[] = []
  for (const p of ordenada) {
    const n = porTipo.get(p.tipo) ?? 0
    if (n < MAX_POR_TIPO) {
      escolhidos.push(p)
      porTipo.set(p.tipo, n + 1)
    }
    else {
      sobras.push(p)
    }
  }
  return [...escolhidos, ...sobras].slice(0, props.limite)
}

async function carregar() {
  estado.value = 'carregando'
  try {
    const r = await $fetch<{ produtos: Produto[] }>(props.endpoint, { query: { pagina: 1 } })
    produtos.value = curar(r.produtos ?? [])
    estado.value = produtos.value.length ? 'pronto' : 'vazio'
  }
  catch {
    estado.value = 'vazio'
  }
}

const { stop } = useIntersectionObserver(raiz, ([entrada]) => {
  if (entrada?.isIntersecting && estado.value === 'esperando') {
    stop()
    carregar()
  }
}, { rootMargin: '400px 0px' })

function atualizarSetas() {
  const el = trilho.value
  if (!el)
    return
  noInicio.value = el.scrollLeft <= 4
  noFim.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}

function rolar(sentido: 1 | -1) {
  const el = trilho.value
  if (el)
    el.scrollBy({ left: sentido * el.clientWidth * 0.85, behavior: 'smooth' })
}

onMounted(atualizarSetas)
watch(estado, () => nextTick(atualizarSetas))
</script>

<template>
  <section v-if="estado !== 'vazio'" ref="raiz" class="mx-auto w-full max-w-7xl px-4 pt-12 md:px-6 md:pt-16 lg:px-8">
    <div class="flex items-end justify-between gap-4">
      <div class="min-w-0">
        <h2 class="text-xl font-bold tracking-tight text-(--texto-primario) md:text-2xl">
          {{ titulo }}
        </h2>
        <p v-if="subtitulo" class="mt-1 text-sm text-(--texto-fraco)">
          {{ subtitulo }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <NuxtLink :to="link" class="flex items-center gap-0.5 rounded-full px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-(--marca-suave)">
          Ver tudo
          <ChevronRight :size="16" />
        </NuxtLink>
        <div class="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="Rolar para a esquerda"
            :disabled="noInicio"
            class="grid h-9 w-9 place-items-center rounded-full border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-secundario) transition hover:border-(--borda-hover) hover:text-(--texto-primario) disabled:cursor-default disabled:opacity-30"
            @click="rolar(-1)"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            type="button"
            aria-label="Rolar para a direita"
            :disabled="noFim"
            class="grid h-9 w-9 place-items-center rounded-full border border-(--borda-forte) bg-(--bg-cartao) text-(--texto-secundario) transition hover:border-(--borda-hover) hover:text-(--texto-primario) disabled:cursor-default disabled:opacity-30"
            @click="rolar(1)"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>

    <div
      ref="trilho"
      class="trilho -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-3 pt-1 md:mx-0 md:gap-4 md:px-0"
      @scroll.passive="atualizarSetas"
    >
      <template v-if="estado === 'pronto'">
        <div v-for="p in produtos" :key="p.id" class="w-[42vw] max-w-48 shrink-0 sm:w-44 md:w-48 lg:w-[calc((100%-5*1rem)/6)] lg:max-w-none">
          <CardProduto :produto="p" :hover-card="hoverCard" class="h-full" />
        </div>
      </template>
      <template v-else>
        <div v-for="n in 6" :key="n" class="w-[42vw] max-w-48 shrink-0 rounded-2xl border border-(--borda) bg-(--bg-cartao) p-2.5 sm:w-44 md:w-48 lg:w-[calc((100%-5*1rem)/6)] lg:max-w-none">
          <div class="aspect-square animate-pulse rounded-xl bg-(--bg-elevado)" />
          <div class="mt-3 h-3 w-full animate-pulse rounded bg-(--bg-elevado)" />
          <div class="mt-2 h-3 w-2/3 animate-pulse rounded bg-(--bg-elevado)" />
          <div class="mt-4 h-6 w-1/2 animate-pulse rounded bg-(--bg-elevado)" />
          <div class="mt-3 h-10 animate-pulse rounded-xl bg-(--bg-elevado)" />
        </div>
      </template>
    </div>
  </section>
</template>
