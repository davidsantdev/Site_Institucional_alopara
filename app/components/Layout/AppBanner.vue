<script setup lang="ts">
import { Apple, Play } from 'lucide-vue-next'
import celulares from '~/assets/img/web/app-celulares.webp'
import { CONTATO } from '~/composables/useNavegacao'
</script>

<template>
  <section aria-labelledby="titulo-app" class="mx-auto w-full max-w-7xl px-4 pt-14 md:px-6 md:pt-20 lg:px-8">
    <div class="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-red-600 via-red-700 to-red-900 px-6 pt-10 text-white md:grid md:grid-cols-2 md:items-center md:gap-8 md:px-14 md:pt-0">
      <div class="pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-32 right-0 -z-10 h-96 w-96 rounded-full bg-black/25 blur-3xl" />

      <div class="md:py-14">
        <p class="text-sm font-semibold text-white/75">
          Aplicativo Alô Pará
        </p>
        <h2 id="titulo-app" class="mt-2 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
          As ofertas do clube no seu bolso
        </h2>
        <p class="mt-3 max-w-md text-white/80">
          Ofertas exclusivas, encartes atualizados e o economizômetro — tudo direto no seu celular.
        </p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a
            :href="CONTATO.appAndroid"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-14 items-center gap-3 rounded-2xl bg-black px-5 transition hover:bg-neutral-800 active:scale-[0.97]"
          >
            <Play :size="22" class="fill-white" />
            <span class="leading-tight">
              <span class="block text-[11px] text-white/70">Disponível no</span>
              <span class="block font-semibold">Google Play</span>
            </span>
          </a>
          <a
            :href="CONTATO.appIos"
            target="_blank"
            rel="noopener noreferrer"
            class="flex h-14 items-center gap-3 rounded-2xl bg-black px-5 transition hover:bg-neutral-800 active:scale-[0.97]"
          >
            <Apple :size="22" class="fill-white" />
            <span class="leading-tight">
              <span class="block text-[11px] text-white/70">Baixar na</span>
              <span class="block font-semibold">App Store</span>
            </span>
          </a>
        </div>
      </div>

      <img
        :src="celulares"
        alt="Telas do aplicativo do Alô Pará em três celulares"
        width="900"
        height="869"
        loading="lazy"
        decoding="async"
        class="mx-auto mt-8 w-full max-w-sm drop-shadow-2xl md:mt-0 md:max-w-md md:translate-y-8"
      >
    </div>
  </section>
</template>
