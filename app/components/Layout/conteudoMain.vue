<script setup lang="ts">
import DialogContato from './DialogContato.vue';
</script>

<template>
  <section class="relative bg-[#111111] min-h-screen flex flex-col items-center pt-15    overflow-hidden px-6 ">

    <!-- Círculo decorativo de fundo -->
    <div class="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[600px] h-[600px]
      bg-red-600 opacity-[0.06] rounded-full pointer-events-none"/>



    <!-- Badge -->
    <span class="bg-red-600 text-white text-[11px] font-bold tracking-[3px] uppercase
      px-5 py-1.5 rounded-[2px] mb-8">
      VERSÂO BETA 
    </span>

    <!-- Título -->
    <p class="text-[#666] text-sm font-semibold tracking-[6px] uppercase mb-2">
      Bem-vindo ao
    </p>
    <h1 class="text-white font-black text-[clamp(52px,10vw,96px)] leading-none tracking-tight text-center">
      <span class="text-red-600">Alô Pará</span>
    </h1>
    <p class="text-[#555] text-sm font-semibold tracking-[2px] uppercase mt-3">
      Supermercado em Novo Repartimento - PA
    </p>

    <p class="text-[#888] text-[15px] text-center max-w-[440px] leading-relaxed mb-10">
      Há anos presente no dia a dia das famílias paraenses, levando
      qualidade, economia e confiança para sua mesa.
    </p>

    <!-- Botões -->
    <div class="flex gap-4 flex-wrap justify-center">

      <DialogContato />

      <a href="#Sobre">
        <button class="bg-transparent hover:bg-red-600 active:scale-[0.98] transition-all
          text-white font-bold text-sm tracking-widest uppercase
          px-8 py-[14px] rounded-[4px] border-2 border-red-600">
          Sobre nós
        </button>
      </a>

    </div>

    <!-- Stats -->
    <div class="flex gap-10 mt-14 pt-8 border-t border-[#222] flex-wrap justify-center">
      <div class="text-center">
        <p class="text-white font-black text-[26px]">+<span class="text-red-600">20</span></p>
        <p class="text-[#666] text-[11px] tracking-[2px] uppercase mt-1">Anos de mercado</p>
      </div>
      <div class="text-center">
          <p class="text-white font-black text-[26px]">+<span class="text-red-600">40K</span></p>
        <p class="text-[#666] text-[11px] tracking-[2px] uppercase mt-1">Clientes atendidos</p>
      </div>
      <div class="text-center">
        <p class="text-white font-black text-[26px]">+<span class="text-red-600">1200</span></p>
        <p class="text-[#666] text-[11px] tracking-[2px] uppercase mt-1">Produtos</p>
      </div>
    </div>

  </section>
</template>