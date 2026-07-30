<script setup lang="ts">
import { Apple, Play, Star } from 'lucide-vue-next'
import celularesImg from '~/assets/img/celulares.png'

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=inovatech.mercafacil.supmercado.alo.para&hl=pt_BR'
const IOS_URL = 'https://apps.apple.com/br/app/supermercado-al%C3%B4-par%C3%A1/id6737360207'
</script>

<template>
  <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-24">
    <div class="absolute -top-25 left-1/2 -translate-x-1/2 w-125 h-125 bg-red-600 opacity-[0.05] rounded-full pointer-events-none" />

    <div class="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-14">
      <div class="flex-1 text-center md:text-left">
        <span class="inline-block bg-red-600 text-white text-[10px] font-black tracking-[3px] uppercase px-4 py-1.5 mb-6">
          Aplicativo
        </span>

        <h1 class="text-white font-black text-[clamp(44px,8vw,88px)] leading-none tracking-tight mb-6">
          Baixe<br>
          <span class="text-red-600">o nosso</span><br>
          aplicativo
        </h1>

        <p class="text-[#666] text-[15px] leading-relaxed max-w-md mb-4 mx-auto md:mx-0">
          Acompanhe ofertas exclusivas, encartes digitais e promoções em
          tempo real. Economize de verdade com o app do Alô Pará direto
          no seu celular.
        </p>

        <div class="flex items-center gap-1.5 justify-center md:justify-start mb-10">
          <Star v-for="n in 5" :key="n" :size="14" class="text-red-600 fill-red-600" />
          <span class="text-[#555] text-[12px] font-semibold ml-1">Avaliado pelos nossos clientes</span>
        </div>

        <div class="flex gap-4 flex-wrap justify-center md:justify-start">
          <a :href="ANDROID_URL" target="_blank" rel="noopener noreferrer">
            <button
              type="button"
              class="flex items-center gap-3 border-2 border-[#2a2a2a] text-white hover:border-red-600 hover:bg-red-600/5 font-bold text-[13px] tracking-widest uppercase px-6 py-3.5 rounded-lg transition-all duration-200"
            >
              <Play :size="20" class="fill-white shrink-0" />
              <span class="flex flex-col items-start leading-tight normal-case tracking-normal">
                <span class="text-[10px] text-[#666] font-medium">Disponível no</span>
                <span class="text-[15px] font-black">Google Play</span>
              </span>
            </button>
          </a>

          <a :href="IOS_URL" target="_blank" rel="noopener noreferrer">
            <button
              type="button"
              class="flex items-center gap-3 border-2 border-[#2a2a2a] text-white hover:border-red-600 hover:bg-red-600/5 font-bold text-[13px] tracking-widest uppercase px-6 py-3.5 rounded-lg transition-all duration-200"
            >
              <Apple :size="22" class="fill-white shrink-0" />
              <span class="flex flex-col items-start leading-tight normal-case tracking-normal">
                <span class="text-[10px] text-[#666] font-medium">Baixar na</span>
                <span class="text-[15px] font-black">App Store</span>
              </span>
            </button>
          </a>
        </div>
      </div>

      <div class="flex-1 hidden md:flex justify-center">
        <div class="relative">
          <div class="absolute inset-0 rounded-2xl bg-red-600 opacity-10 translate-x-3 translate-y-3" />
          <img
            :src="celularesImg"
            alt="Aplicativo do Supermercado Alô Pará em três celulares"
            class="relative w-full max-w-100 object-contain"
          >
        </div>
      </div>
    </div>
  </section>
</template>
