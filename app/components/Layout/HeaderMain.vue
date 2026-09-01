<script setup lang="ts">
import { Moon, ShoppingCart, Sun, Tag } from 'lucide-vue-next'
import { useTema } from '~/composables/useTema'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import Mobilemenu from './Mobilemenu.vue'

const { totalItens } = useCarrinho()
const { tema, alternar } = useTema()

const navLinks = [
  { label: 'Ofertas', to: '/ofertas' },
  { label: 'Alimentos', to: '/alimentos' },
  { label: 'Bebidas', to: '/bebidas' },
  { label: 'Limpeza', to: '/limpeza' },
  { label: 'Perfumaria', to: '/perfumaria' },
]
</script>

<template>
  <div class="w-full sticky top-0 z-50 bg-(--bg-pagina)">
    <!-- Tira superior vermelha -->
    <div class="bg-red-600 h-[34px] hidden md:flex items-center justify-center gap-8">
      <button type="button" class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors" @click="navigateTo('/')">
        COMPRE ONLINE
      </button>
      <button type="button" class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors" @click="navigateTo('/trabalhe-conosco')">
        TRABALHE CONOSCO
      </button>
      <a
        href="https://cadastramento-alopara.mercafacil.com/home"
        target="_blank"
        rel="noopener noreferrer"
        class="text-white/80 hover:text-white text-[10px] font-bold tracking-[2px] uppercase transition-colors"
      >
        CLUBE DE DESCONTOS
      </a>
    </div>

    <!-- Header principal -->
    <div class="flex items-center justify-between px-6 lg:px-10 h-[72px] border-b border-(--borda)">
      <!-- Logo -->
      <NuxtLink to="/" class="flex flex-col gap-0.5 shrink-0">
        <img class="w-35" src="/gg.png">
      </NuxtLink>

      <!-- Ações -->
      <div class="flex items-center gap-2">
        <!-- Modo claro/escuro -->
        <button
          type="button"
          :aria-label="tema === 'claro' ? 'Ativar modo escuro' : 'Ativar modo claro'"
          :title="tema === 'claro' ? 'Modo escuro' : 'Modo claro'"
          class="w-[46px] h-[46px] border border-(--borda) rounded-[3px] flex items-center justify-center hover:border-red-600 hover:bg-red-600/5 transition-all"
          @click="alternar"
        >
          <component :is="tema === 'claro' ? Moon : Sun" :size="18" class="text-red-600" />
        </button>

        <!-- Carrinho -->
        <NuxtLink
          to="/Carrinho"
          class="relative w-[46px] h-[46px] border border-(--borda) rounded-[3px] flex items-center justify-center hover:border-red-600 hover:bg-red-600/5 transition-all"
        >
          <ShoppingCart :size="20" class="text-red-600" />
          <span
            v-if="totalItens.compra"
            class="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1 border-2 border-(--bg-pagina)"
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

    <!-- Nav de categorias (mobile) — sem isto, Ofertas só existia dentro do
         hambúrguer, escondida atrás de vários toques. -->
    <div class="flex md:hidden items-center gap-2 px-4 h-[52px] border-b border-(--borda) overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <NuxtLink
        to="/ofertas"
        class="shrink-0 flex items-center gap-1 bg-red-600 text-white text-[11px] font-black tracking-[1px] uppercase px-3.5 py-1.5 rounded-full"
      >
        <Tag :size="12" />
        Ofertas
      </NuxtLink>
      <NuxtLink
        v-for="link in navLinks.slice(1)"
        :key="link.to"
        :to="link.to"
        class="shrink-0 text-[11px] font-bold tracking-[1px] uppercase text-(--texto-suave) px-3.5 py-1.5 rounded-full border border-(--borda) transition-all"
        active-class="text-red-600 border-red-600"
      >
        {{ link.label }}
      </NuxtLink>
    </div>

    <!-- Nav de categorias (desktop) -->
    <div class="hidden md:flex items-center px-6 lg:px-10 h-[44px] border-b border-(--borda) gap-1">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="text-[11px] font-bold tracking-[1.5px] uppercase text-(--texto-suave) px-4 py-1.5 rounded-[3px] hover:text-(--texto-primario) hover:bg-(--bg-elevado) transition-all"
        active-class="text-red-600"
      >
        {{ link.label }}
      </NuxtLink>

      <div class="ml-auto flex items-center gap-2">
        <div class="w-1.5 h-1.5 bg-red-600 rounded-full" />
        <NuxtLink to="/Baixar" class="text-[10px] font-bold tracking-[2px] uppercase text-(--texto-minimo) hover:text-(--texto-suave) transition-colors">
          Baixar app
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
