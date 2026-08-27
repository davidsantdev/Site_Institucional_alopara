<script setup lang="ts">
import { Download, Home, Menu, ShoppingBasket, Sparkles, Tag, User2, X } from 'lucide-vue-next'
import { ref } from 'vue'

const aberto = ref(false)

const navPrincipal = [
  { label: 'Início', rota: '/', icone: Home },
  { label: 'Trabalhe conosco', rota: '/trabalhe-conosco', icone: User2 },
  { label: 'Baixar app', rota: '/Baixar', icone: Download },
  { label: 'Clube de descontos', href: 'https://cadastramento-alopara.mercafacil.com/home', icone: Tag },
]

const categorias = [
  { label: 'Ofertas', rota: '/Ofertas', icone: Tag },
  { label: 'Alimentos', rota: '/Alimentos', icone: ShoppingBasket },
  { label: 'Bebidas', rota: '/Bebidas', icone: ShoppingBasket },
  { label: 'Limpeza', rota: '/Limpeza', icone: ShoppingBasket },
  { label: 'Perfumaria', rota: '/Perfumaria', icone: Sparkles },
]

function ir(rota?: string) {
  aberto.value = false
  if (rota)
    navigateTo(rota)
}
</script>

<template>
  <div>
    <!-- botão hambúrguer -->
    <button
      class="flex items-center justify-center w-10 h-10 rounded-lg border border-[#2a2a2a] bg-[#161616] text-white hover:border-red-600 transition-colors duration-200"
      @click="aberto = true"
    >
      <Menu :size="20" />
    </button>

    <!-- backdrop -->
    <Transition name="fade">
      <div
        v-if="aberto"
        class="fixed inset-0 bg-black/70 z-40"
        @click="aberto = false"
      />
    </Transition>

    <!-- drawer -->
    <Transition name="slide">
      <div
        v-if="aberto"
        class="fixed top-0 right-0 h-full w-[300px] bg-[#111] z-50 flex flex-col overflow-y-auto"
      >
        <!-- header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f]">
          <div>
            <p class="text-white text-[18px] font-black leading-none">
              <span class="text-red-600">Alô</span> Pará
            </p>
            <p class="text-[#444] text-[9px] font-bold tracking-[3px] uppercase mt-0.5">
              Supermercado
            </p>
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg border border-[#2a2a2a] text-[#555] hover:border-red-600 hover:text-white transition-all duration-200"
            @click="aberto = false"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- nav principal -->
        <div class="flex flex-col px-3 pt-4 gap-0.5">
          <template v-for="item in navPrincipal" :key="item.label">
            <!-- LINK EXTERNO -->
            <a
              v-if="item.href"
              :href="item.href"
              target="_blank"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150 group"
              @click="aberto = false"
            >
              <component :is="item.icone" :size="16" class="text-[#333] group-hover:text-red-600 transition-colors shrink-0" />
              <span class="text-[14px] font-semibold">{{ item.label }}</span>
            </a>

            <!-- LINK INTERNO -->
            <button
              v-else
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150 w-full text-left group"
              @click="ir(item.rota)"
            >
              <component :is="item.icone" :size="16" class="text-[#333] group-hover:text-red-600 transition-colors shrink-0" />
              <span class="text-[14px] font-semibold">{{ item.label }}</span>
            </button>
          </template>
        </div>

        <!-- categorias -->
        <div class="flex items-center gap-3 px-6 mt-6 mb-3">
          <span class="text-[10px] font-black tracking-[3px] uppercase text-red-600">Categorias</span>
          <div class="flex-1 h-px bg-[#1f1f1f]" />
        </div>

        <div class="flex flex-col px-3 gap-0.5">
          <button
            v-for="cat in categorias"
            :key="cat.rota"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all duration-150 w-full text-left group"
            @click="ir(cat.rota)"
          >
            <component :is="cat.icone" :size="16" class="text-[#333] group-hover:text-red-600 transition-colors shrink-0" />
            <span class="text-[14px] font-semibold">{{ cat.label }}</span>
          </button>
        </div>

        <!-- footer -->
        <div class="mt-auto px-6 py-6 border-t border-[#1f1f1f]">
          <p class="text-[#2a2a2a] text-[10px] font-bold tracking-[2px] uppercase">
            © Alô Pará · Todos os direitos reservados
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
