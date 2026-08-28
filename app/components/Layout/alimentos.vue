<script setup lang="ts">
import { ChevronRight, Flame, ShoppingBasket } from 'lucide-vue-next'
import { percentualDesconto } from '~/composables/useCatalogo'
import { useVitrine } from '~/composables/useVitrine'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'

import DialogTrigger from '../ui/dialog/DialogTrigger.vue'
import Limpeza from './limpeza.vue'
import Perfumaria from './Perfumaria.vue'

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
          <div class="h-px w-10 bg-(--borda)" />
        </div>
        <button
          type="button"
          class="flex items-center gap-1 text-[11px] font-bold tracking-[2px] uppercase text-(--texto-suave) hover:text-red-600 transition-colors"
          @click="navigateTo('/Alimentos')"
        >
          Ver mais
          <ChevronRight :size="13" />
        </button>
      </div>

      <!-- skeleton -->
      <div v-if="carregando" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        <div v-for="n in 5" :key="n" class="flex flex-col bg-(--bg-cartao) border border-(--borda) rounded-2xl overflow-hidden">
          <div class="h-32 md:h-36 bg-(--bg-elevado) animate-pulse" />
          <div class="p-3 flex flex-col gap-2">
            <div class="h-3 rounded bg-(--borda) animate-pulse w-full" />
            <div class="h-3 rounded bg-(--borda) animate-pulse w-2/3" />
            <div class="h-5 rounded bg-(--borda) animate-pulse w-1/2 mt-1" />
          </div>
        </div>
      </div>

      <!-- grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        <Dialog v-for="A in alimentosLimitados" :key="A.id">
          <DialogTrigger as-child>
            <div class="group relative flex flex-col bg-(--bg-cartao) border border-(--borda) rounded-2xl overflow-hidden cursor-pointer hover:border-red-600 hover:-translate-y-1 transition-all duration-300">
              <!-- badge: promoção tem prioridade sobre o "Top" decorativo -->
              <div v-if="A.emPromocao" class="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black tracking-wide px-2 py-1 rounded-full uppercase">
                -{{ percentualDesconto(A.precoOriginal, A.preco2) }}%
              </div>
              <div v-else class="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black tracking-wide px-2 py-1 rounded-full flex items-center gap-1 uppercase">
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
                <h3 class="text-[12px] md:text-[13px] text-(--texto-secundario) font-medium leading-snug line-clamp-2 min-h-[2.2rem]">
                  {{ A.nome }}
                </h3>
                <div class="mt-auto">
                  <template v-if="A.emPromocao">
                    <p class="text-[9px] leading-tight text-(--texto-fraco)">
                      Preço normal: <span class="line-through">R$ {{ A.precoOriginal }}</span>
                    </p>
                    <p class="leading-tight">
                      <span class="block text-[8px] font-black uppercase tracking-wide text-emerald-500">Preço do clube</span>
                      <span class="text-lg md:text-xl font-extrabold text-green-400">R$ {{ A.preco2 }}</span>
                    </p>
                  </template>
                  <span v-else class="text-lg md:text-xl font-extrabold text-green-400">
                    R$ {{ A.preco2 }}
                  </span>
                </div>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent class="bg-(--bg-cartao) border border-(--borda) rounded-3xl p-0 md:w-120 w-[92vw] overflow-hidden">
            <div class="flex items-center justify-center bg-[#fafafa] h-60 p-6 relative">
              <span class="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                Imperdível
              </span>
              <img class="h-44 object-contain" :src="A.img" alt="">
            </div>

            <div class="px-7 py-6">
              <span class="text-[11px] text-(--texto-suave) uppercase tracking-widest font-bold">{{ A.tipo }}</span>
              <h2 class="mt-1 text-xl font-bold text-(--texto-primario) leading-snug">
                {{ A.nome }}
              </h2>
              <div class="mt-2">
                <p v-if="A.emPromocao" class="text-sm text-(--texto-fraco)">
                  Preço normal: <span class="line-through">R$ {{ A.precoOriginal }}</span>
                </p>
                <span v-if="A.emPromocao" class="mb-0.5 block text-xs font-black uppercase tracking-wide text-emerald-500">
                  Preço do clube
                </span>
                <p class="text-4xl font-black text-green-400">
                  R$ {{ A.preco2 }}
                </p>
              </div>

              <div class="mt-6 flex items-center gap-3">
                <div class="flex items-center gap-1 rounded-xl bg-(--bg-elevado) border border-(--borda-forte) p-1">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-(--texto-primario) text-lg hover:bg-(--borda-forte) transition"
                    @click="diminuir(A.id)"
                  >
                    −
                  </button>
                  <span class="min-w-8 text-center font-bold text-(--texto-primario)">{{ A.quantidade }}</span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-(--texto-primario) text-lg hover:bg-(--borda-forte) transition"
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
