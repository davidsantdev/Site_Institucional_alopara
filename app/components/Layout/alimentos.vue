<script setup lang="ts">
import { ChevronRight, Flame, ShoppingBasket } from 'lucide-vue-next'
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'
import Limpeza from './limpeza.vue'
import Perfumaria from './Perfumaria.vue'

import { useVitrine } from '~/composables/useVitrine'
import { useCarrinho } from '~/data/composable/UseCarrinho'

const { adicionarCarrinho } = useCarrinho()
const { produtos: alimentosLimitados, carregando } = useVitrine('/api/alimentos', { limite: 5 })

const produtoSelecionado = ref<any>(null)

function aumentar(id: string) {
  const item = alimentosLimitados.value.find(p => p.id === id)
  if (item)
    item.quantidade++
}

function diminuir(id: string) {
  const item = alimentosLimitados.value.find(p => p.id === id)
  if (item && item.quantidade > 1)
    item.quantidade--
}
</script>

<template>
  <div>
  <section v-if="carregando || alimentosLimitados.length" class="w-full max-w-6xl mx-auto px-4 md:px-6 mb-14">
    <!-- cabeçalho -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Alimentos</span>
        <div class="h-px w-10 bg-[#1f1f1f]" />
      </div>
      <button
        type="button"
        class="flex items-center gap-1 text-[11px] font-bold tracking-[2px] uppercase text-[#555] hover:text-red-600 transition-colors"
        @click="navigateTo('/Alimentos')"
      >
        Ver mais
        <ChevronRight :size="13" />
      </button>
    </div>

    <!-- skeleton -->
    <div v-if="carregando" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      <div v-for="n in 5" :key="n" class="flex flex-col bg-[#161616] border border-[#1f1f1f] rounded-2xl overflow-hidden">
        <div class="h-32 md:h-36 bg-[#1a1a1a] animate-pulse" />
        <div class="p-3 flex flex-col gap-2">
          <div class="h-3 rounded bg-[#1f1f1f] animate-pulse w-full" />
          <div class="h-3 rounded bg-[#1f1f1f] animate-pulse w-2/3" />
          <div class="h-5 rounded bg-[#1f1f1f] animate-pulse w-1/2 mt-1" />
        </div>
      </div>
    </div>

    <!-- grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
      <Dialog v-for="A in alimentosLimitados" :key="A.id">
        <DialogTrigger as-child>
          <div class="group relative flex flex-col bg-[#161616] border border-[#1f1f1f] rounded-2xl overflow-hidden cursor-pointer hover:border-red-600 hover:-translate-y-1 transition-all duration-300">
            <!-- badge -->
            <div class="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black tracking-wide px-2 py-1 rounded-full flex items-center gap-1 uppercase">
              <Flame :size="10" /> Top
            </div>

            <!-- adicionar rápido -->
            <button
              type="button"
              aria-label="Adicionar ao carrinho"
              class="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white text-base font-bold shadow flex items-center justify-center active:scale-95 transition-all"
              @click.stop="adicionarCarrinho(A, 1)"
            >
              +
            </button>

            <!-- imagem -->
            <div class="flex items-center justify-center bg-[#fafafa] h-32 md:h-36 p-4">
              <img class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" :src="A.img" alt="">
            </div>

            <!-- infos -->
            <div class="flex flex-1 flex-col gap-2 p-3">
              <h3 class="text-[12px] md:text-[13px] text-[#ccc] font-medium leading-snug line-clamp-2 min-h-[2.2rem]">
                {{ A.nome }}
              </h3>
              <span class="mt-auto text-lg md:text-xl font-extrabold text-green-400">
                R$ {{ A.preco2 }}
              </span>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent class="bg-[#111] border border-[#1f1f1f] rounded-3xl p-0 md:w-120 w-[92vw] overflow-hidden">
          <div class="flex items-center justify-center bg-[#fafafa] h-60 p-6 relative">
            <span class="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
              Imperdível
            </span>
            <img class="h-44 object-contain" :src="A.img" alt="">
          </div>

          <div class="px-7 py-6">
            <span class="text-[11px] text-[#555] uppercase tracking-widest font-bold">{{ A.tipo }}</span>
            <h2 class="mt-1 text-xl font-bold text-white leading-snug">
              {{ A.nome }}
            </h2>
            <p class="mt-2 text-4xl font-black text-green-400">
              R$ {{ A.preco2 }}
            </p>

            <div class="mt-6 flex items-center gap-3">
              <div class="flex items-center gap-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                  @click="diminuir(A.id)"
                > 
                  −
                </button>
                <span class="min-w-8 text-center font-bold text-white">{{ A.quantidade }}</span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                  @click="aumentar(A.id)"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold py-3.5 shadow-lg shadow-red-900/30"
                @click="produtoSelecionado = A; adicionarCarrinho(A, A.quantidade)"
              >
                <ShoppingBasket :size="18" />
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </section>

  <Limpeza />
  <Perfumaria />
  </div>
</template>
