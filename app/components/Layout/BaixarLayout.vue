<script setup lang="ts">
import { Apple, Play, Star } from 'lucide-vue-next'
import celularesImg from '~/assets/img/web/app-celulares.webp'
import { CONTATO } from '~/composables/useNavegacao'
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <div class="pointer-events-none absolute -right-32 -top-40 -z-10 h-130 w-130 rounded-full bg-red-600/12 blur-3xl" aria-hidden="true" />

    <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:px-6 md:py-24 lg:px-8">
      <div class="text-center md:text-left">
        <p class="text-sm font-semibold text-red-600">
          Aplicativo Alô Pará
        </p>
        <h1 class="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-(--texto-primario) md:text-6xl">
          As ofertas do clube <span class="text-red-600">no seu bolso</span>
        </h1>
        <p class="mx-auto mt-5 max-w-md text-lg leading-relaxed text-(--texto-esmaecido) md:mx-0">
          Acompanhe ofertas exclusivas, encartes digitais e promoções em tempo real.
          Economize de verdade com o app do Alô Pará.
        </p>

        <div class="mt-5 flex items-center justify-center gap-1.5 md:justify-start">
          <Star v-for="n in 5" :key="n" :size="16" class="fill-amber-400 text-amber-400" />
          <span class="ml-1 text-sm font-medium text-(--texto-fraco)">Avaliado pelos nossos clientes</span>
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <a
            :href="CONTATO.appAndroid"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-14 items-center gap-3 rounded-2xl bg-neutral-950 px-5 text-white transition hover:bg-neutral-800 active:scale-[0.97]"
          >
            <Play :size="22" class="fill-white" />
            <span class="text-left leading-tight">
              <span class="block text-[11px] text-white/70">Disponível no</span>
              <span class="block font-semibold">Google Play</span>
            </span>
          </a>
          <a
            :href="CONTATO.appIos"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-14 items-center gap-3 rounded-2xl bg-neutral-950 px-5 text-white transition hover:bg-neutral-800 active:scale-[0.97]"
          >
            <Apple :size="22" class="fill-white" />
            <span class="text-left leading-tight">
              <span class="block text-[11px] text-white/70">Baixar na</span>
              <span class="block font-semibold">App Store</span>
            </span>
          </a>
        </div>
      </div>

      <img
        :src="celularesImg"
        alt="Aplicativo do Supermercado Alô Pará em três celulares"
        width="900"
        height="869"
        class="mx-auto w-full max-w-md drop-shadow-2xl"
      >
    </div>
  </section>
</template>
