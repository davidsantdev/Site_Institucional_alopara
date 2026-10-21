<script setup lang="ts">
/**
 * As campanhas fixas da semana (as artes de "Segunda do Hortifruti" etc.).
 * Antes era um carrossel de imagens soltas, sem link; agora cada uma leva pra
 * categoria dela e a de HOJE vem primeiro, com selo.
 *
 * "Hoje" só é calculado no navegador: a home é pré-renderizada no build, e o
 * dia da semana do servidor na hora do deploy estaria errado dias depois.
 */
import { ArrowRight } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import fim from '~/assets/img/web/campanha-fim.webp'
import qua from '~/assets/img/web/campanha-qua.webp'
import seg from '~/assets/img/web/campanha-seg.webp'
import sex from '~/assets/img/web/campanha-sex.webp'
import ter from '~/assets/img/web/campanha-ter.webp'

interface Campanha {
  /** Dias (Date.getDay: 0 = domingo) em que a campanha vale. */
  dias: number[]
  dia: string
  titulo: string
  imagem: string
  rota: string
}

const CAMPANHAS: Campanha[] = [
  { dias: [1], dia: 'Segunda', titulo: 'Segunda do Hortifruti', imagem: seg, rota: '/frutas' },
  { dias: [2], dia: 'Terça', titulo: 'Terça do Açougue', imagem: ter, rota: '/carnes' },
  { dias: [3], dia: 'Quarta', titulo: 'Quarta da Padaria', imagem: qua, rota: '/alimentos' },
  { dias: [5], dia: 'Sexta', titulo: 'Sexta da Carne', imagem: sex, rota: '/carnes' },
  { dias: [6, 0], dia: 'Sábado e domingo', titulo: 'Ofertas de Fim de Semana', imagem: fim, rota: '/ofertas' },
]

const hoje = ref<number | null>(null)
onMounted(() => {
  hoje.value = new Date().getDay()
})

const ordenadas = computed(() => {
  const i = CAMPANHAS.findIndex(c => hoje.value !== null && c.dias.includes(hoje.value))
  return i <= 0 ? CAMPANHAS : [...CAMPANHAS.slice(i), ...CAMPANHAS.slice(0, i)]
})

function ehHoje(c: Campanha) {
  return hoje.value !== null && c.dias.includes(hoje.value)
}
</script>

<template>
  <section aria-labelledby="titulo-campanhas" class="mx-auto w-full max-w-7xl px-4 pt-12 md:px-6 md:pt-16 lg:px-8">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 id="titulo-campanhas" class="text-xl font-bold tracking-tight text-(--texto-primario) md:text-2xl">
          Promoções de cada dia
        </h2>
        <p class="mt-1 text-sm text-(--texto-fraco)">
          Toda semana tem dia certo pra economizar
        </p>
      </div>
      <NuxtLink to="/encartes" class="flex shrink-0 items-center gap-0.5 rounded-full px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-(--marca-suave)">
        Encartes
        <ArrowRight :size="16" />
      </NuxtLink>
    </div>

    <div class="trilho -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
      <NuxtLink
        v-for="c in ordenadas"
        :key="c.titulo"
        :to="c.rota"
        class="group w-[84%] shrink-0 overflow-hidden rounded-2xl border bg-(--bg-cartao) transition duration-300 hover:-translate-y-0.5 hover:shadow-(--sombra-2) sm:w-[60%] lg:w-[calc((100%-2rem)/2.4)]"
        :class="ehHoje(c) ? 'border-red-600 ring-1 ring-red-600' : 'border-(--borda) hover:border-(--borda-forte)'"
      >
        <div class="relative aspect-[1280/467] overflow-hidden">
          <img
            :src="c.imagem"
            :alt="c.titulo"
            width="1280"
            height="467"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          >
          <span v-if="ehHoje(c)" class="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
            Hoje
          </span>
        </div>
        <div class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="min-w-0">
            <span class="block text-xs font-medium text-(--texto-fraco)">{{ c.dia }}</span>
            <span class="block truncate font-semibold text-(--texto-primario)">{{ c.titulo }}</span>
          </span>
          <ArrowRight :size="18" class="shrink-0 text-(--texto-fraco) transition group-hover:translate-x-0.5 group-hover:text-red-600" />
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
