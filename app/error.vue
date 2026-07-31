<script setup lang="ts">
import type { NuxtError } from '#app'
import { Home, RotateCcw, ShoppingBasket } from 'lucide-vue-next'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'

const props = defineProps<{ error: NuxtError }>()

const e404 = props.error.statusCode === 404

useHead({
  title: e404 ? 'Página não encontrada | Alô Pará' : 'Erro | Alô Pará',
})

function tentarNovamente() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen bg-[#111111] flex flex-col font-sans">
    <HeaderMain />

    <main class="flex flex-1 items-center justify-center px-4 py-24">
      <div class="text-center max-w-md">
        <p class="text-8xl font-black text-[#1f1f1f] leading-none">
          {{ e404 ? '404' : error.statusCode }}
        </p>

        <ShoppingBasket :size="40" class="mx-auto -mt-8 text-red-600" />

        <h1 class="mt-6 text-2xl font-black text-white tracking-tight">
          {{ e404 ? 'Essa página saiu de linha' : 'Algo deu errado' }}
        </h1>
        <p class="mt-2 text-[#666]">
          {{ e404
            ? 'O produto ou a página que você procura não existe ou foi movida.'
            : 'Não conseguimos carregar essa página agora. Tente novamente em instantes.' }}
        </p>

        <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-white font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/30"
            @click="tentarNovamente"
          >
            <Home :size="18" />
            Voltar à página inicial
          </button>
          <button
            v-if="!e404"
            type="button"
            class="flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#161616] px-6 py-3 text-[#ccc] font-bold hover:border-[#3a3a3a] hover:text-white active:scale-95 transition-all"
            @click="() => $router.go(0)"
          >
            <RotateCcw :size="18" />
            Tentar de novo
          </button>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
