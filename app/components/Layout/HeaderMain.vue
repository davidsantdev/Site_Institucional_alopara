<script setup lang="ts">
import { ShoppingCart, User } from 'lucide-vue-next'
import Mobilemenu from './Mobilemenu.vue'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import { Label } from 'reka-ui'

const { totalItens } = useCarrinho()

const navLinks = [
  { label: 'Alimentos', to: '/alimentos' },
 
  { label: 'Bebidas', to: '/bebidas' },
  { label: 'Limpeza', to: '/limpeza' },
   { label: 'Limpeza', to: '/perfumaria' },
    { label: 'Ofertas', to: '/vinhos' }
]


</script>

<template>
  <div class="w-full sticky top-0 z-50 bg-[#111111]">

    <!-- Tira superior vermelha -->
    <div class="bg-red-600 h-[34px] hidden md:flex items-center justify-center gap-8">
      



      <bUtton   class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors" > COMPRE ONLINE</bUtton>
      <bUtton @click="navigateTo('/trabalhe-conosco')"  class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors"> TRABALHE CONOSCO</bUtton>
      <bUtton  class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors"> CLUBE DE DESCONTOS</bUtton>
    </div>

    <!-- Header principal -->
    <div class="flex items-center justify-between px-6 lg:px-10 h-[72px] border-b border-[#1f1f1f]">

      <!-- Logo -->
      <NuxtLink to="/" class="flex flex-col gap-0.5 shrink-0">
        <span class="text-[26px] font-black text-white leading-none tracking-tight">
          <span class="text-red-600">Alô</span> Pará
        </span>
        <span class="text-[9px] font-bold tracking-[4px] uppercase text-[#444]">Supermercado</span>
      </NuxtLink>

 
     

      <!-- Ações -->
      <div class="flex items-center gap-2">

        <!-- Conta (desktop) -->
    
        <!-- Carrinho -->
        <NuxtLink
          to="/Carrinho"
          class="relative w-[46px] h-[46px] border border-[#1f1f1f] rounded-[3px] flex items-center justify-center hover:border-red-600 hover:bg-red-600/5 transition-all"
        >
          <ShoppingCart :size="20" class="text-red-600" />
          <span
            v-if="totalItens.compra"
            class="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#111]"
          >
            {{ totalItens.total }}
          </span>
        </NuxtLink>

        <!-- Menu mobile -->
        <div class="md:hidden ml-1">
          <Mobilemenu />
        </div>
      </div>
    </div>

    <!-- Nav de categorias (desktop) -->
    <div class="hidden md:flex items-center px-6 lg:px-10 h-[44px] border-b border-[#1a1a1a] gap-1">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="text-[11px] font-bold tracking-[1.5px] uppercase text-[#555] px-4 py-1.5 rounded-[3px] hover:text-white hover:bg-[#1a1a1a] transition-all"
        active-class="text-red-600"
      >
        {{ link.label }}
      </NuxtLink>

      <div class="ml-auto flex items-center gap-2">
        <div class="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
        <NuxtLink to="/Baixar" class="text-[10px] font-bold tracking-[2px] uppercase text-[#333] hover:text-[#555] transition-colors">
          Baixar app
        </NuxtLink>
      </div>
    </div>

  </div>
</template>