<script setup lang="ts">
import { imagemEmoji } from '~/composables/useCatalogo'
import { CATEGORIAS_LOJA } from '~/composables/useNavegacao'
</script>

<template>
  <section aria-labelledby="titulo-categorias" class="mx-auto w-full max-w-7xl px-4 pt-10 md:px-6 md:pt-14 lg:px-8">
    <h2 id="titulo-categorias" class="text-xl font-bold tracking-tight text-(--texto-primario) md:text-2xl">
      Compre por categoria
    </h2>

    <div class="trilho -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-4 md:overflow-visible md:px-0">
      <NuxtLink
        v-for="c in CATEGORIAS_LOJA"
        :key="c.rota"
        :to="c.rota"
        class="group flex w-26 shrink-0 flex-col items-center gap-2.5 text-center md:w-auto"
      >
        <span class="relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) transition duration-300 group-hover:-translate-y-1 group-hover:border-(--borda-forte) group-hover:shadow-(--sombra-2)">
          <span class="absolute inset-[14%] rounded-full transition-transform duration-500 group-hover:scale-110" :class="c.fundo" />
          <img
            v-if="c.imagem"
            :src="c.imagem"
            alt=""
            loading="lazy"
            decoding="async"
            class="relative h-[68%] w-[68%] object-contain transition-transform duration-300 group-hover:scale-110"
          >
          <span v-else-if="c.emojis" class="relative flex items-end text-[1.9rem] leading-none transition-transform duration-300 group-hover:scale-110 sm:text-[2.3rem] lg:text-[2.7rem]" aria-hidden="true">
            <img :src="imagemEmoji(c.emojis[0]!)" alt="" width="256" height="256" loading="lazy" class="-mr-2.5 h-[1em] w-[1em] -rotate-12 drop-shadow-sm">
            <img :src="imagemEmoji(c.emojis[1]!)" alt="" width="256" height="256" loading="lazy" class="z-1 -mb-1 h-[1.25em] w-[1.25em] drop-shadow-sm">
            <img :src="imagemEmoji(c.emojis[2]!)" alt="" width="256" height="256" loading="lazy" class="-ml-2.5 h-[1em] w-[1em] rotate-12 drop-shadow-sm">
          </span>
          <component :is="c.icone" v-else class="relative h-[38%] w-[38%] text-red-600 transition-transform duration-300 group-hover:scale-110" :stroke-width="1.75" />
        </span>
        <span>
          <span class="block text-sm font-semibold text-(--texto-primario) transition-colors group-hover:text-red-600">{{ c.label }}</span>
          <span class="mt-0.5 block text-xs text-(--texto-fraco)">{{ c.descricao }}</span>
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
