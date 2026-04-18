<script setup lang="ts">
import Button from '../ui/button/Button.vue';
import Dialog from '../ui/dialog/Dialog.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
import DialogHeader from '../ui/dialog/DialogHeader.vue';
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';
</script>

<template>
  <section class="relative bg-[#111111] min-h-screen flex flex-col items-center pt-15 overflow-hidden px-6 ">

    <!-- Círculo decorativo de fundo -->
    <div class="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[600px] h-[600px]
      bg-red-600 opacity-[0.06] rounded-full pointer-events-none"/>



    <!-- Badge -->
    <span class="bg-red-600 text-white text-[11px] font-bold tracking-[3px] uppercase
      px-5 py-1.5 rounded-[2px] mb-8">
      Supermercado Alô Pará
    </span>

    <!-- Título -->
    <p class="text-[#666] text-sm font-semibold tracking-[6px] uppercase mb-2">
      Bem-vindo ao
    </p>
    <h1 class="text-white font-black text-[clamp(52px,10vw,96px)] leading-none tracking-tight text-center">
      <span class="text-red-600">Alô Pará</span>
    </h1>

    <!-- Divisor -->


    <!-- Subtítulo -->
    <p class="text-[#888] text-[15px] text-center max-w-[440px] leading-relaxed mb-10">
      Há anos presente no dia a dia das famílias paraenses, levando
      qualidade, economia e confiança para sua mesa.
    </p>

    <!-- Botões -->
    <div class="flex gap-4 flex-wrap justify-center">

      <Dialog>
        <DialogTrigger as-child>
          <button class="bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all
            text-white font-bold text-sm tracking-widest uppercase
            px-8 py-[14px] rounded-[4px]">
            Entre em contato
          </button>
        </DialogTrigger>

        <DialogContent class="flex flex-col items-center text-center">
          <DialogHeader>
            <h2 class="text-[28px] font-extrabold text-center mb-1">Contato</h2>
            <p class="text-slate-500 text-sm">Escolha o departamento desejado</p>
          </DialogHeader>
          <div class="flex flex-col w-full gap-3 mt-4">
            <Button variant="outline" class="p-6 text-[16px] font-semibold hover:border-red-500 hover:text-red-600 transition-colors">Atacado</Button>
            <Button variant="outline" class="p-6 text-[16px] font-semibold hover:border-red-500 hover:text-red-600 transition-colors">Financeiro</Button>
            <Button variant="outline" class="p-6 text-[16px] font-semibold hover:border-red-500 hover:text-red-600 transition-colors">Recursos Humanos</Button>
            <Button variant="outline" class="p-6 text-[16px] font-semibold hover:border-red-500 hover:text-red-600 transition-colors">Seja um fornecedor</Button>
            <Button variant="outline" class="p-6 text-[16px] font-semibold hover:border-red-500 hover:text-red-600 transition-colors">Suporte</Button>
          </div>
        </DialogContent>
      </Dialog>

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