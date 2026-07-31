<script setup lang="ts">
import { ChevronLeft, ChevronRight, Flame, GlassWater, ShoppingBasket } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { useCarrinho } from '~/data/composable/UseCarrinho'
import Vinho from '../data/produtosVinho.json'

const { adicionarCarrinho } = useCarrinho()

useSeoMeta({
  title: 'Vinhos | Alô Pará',
  description: 'Confira nossa seleção de vinhos no Supermercado Alô Pará, em Novo Repartimento - PA.',
  ogTitle: 'Vinhos | Alô Pará',
  ogDescription: 'Confira nossa seleção de vinhos no Supermercado Alô Pará.',
})

const produtos = ref(Vinho)

const produtoSelecionado = ref<any>(null)

const paginaAtual = ref(1)
const itensPorPagina = 10

const totalPaginas = computed(() =>
  Math.ceil(produtos.value.length / itensPorPagina))

const produtosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return produtos.value.slice(inicio, fim)
})

function irParaPagina(pagina: number) {
  paginaAtual.value = pagina
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function aumentar(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item)
    item.quantidade++
}

function diminuir(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item && item.quantidade > 1)
    item.quantidade--
}
</script>

<template>
  <div class="bg-[#111111] min-h-screen flex flex-col font-sans">
    <HeaderMain />

    <!-- HERO -->
    <div class="relative overflow-hidden px-4 py-14 text-center border-b border-[#1a1a1a]">
      <div class="absolute top-[-140px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600 opacity-[0.06] rounded-full pointer-events-none" />

      <div class="relative mx-auto max-w-3xl">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-[10px] font-black tracking-[3px] uppercase text-white">
          <GlassWater :size="13" />
          Adega
        </div>
        <h1 class="text-white font-black text-[clamp(32px,6vw,52px)] leading-none tracking-tight">
          Os <span class="text-red-600">vinhos</span> mais comprados
        </h1>
        <p class="mt-3 text-[#666] text-sm md:text-base">
          {{ produtos.length }} rótulos selecionados para você no Alô Pará
        </p>
      </div>
    </div>

    <!-- GRID -->
    <main class="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
      >
        <Dialog v-for="V in produtosPaginados" :key="V.id">
          <DialogTrigger as-child>
            <div class="group relative flex flex-col bg-[#161616] border border-[#1f1f1f] rounded-2xl overflow-hidden cursor-pointer hover:border-red-600 hover:-translate-y-1 transition-all duration-300">
              <div class="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[9px] font-black tracking-wide px-2 py-1 rounded-full flex items-center gap-1 uppercase">
                <Flame :size="10" /> Top
              </div>

              <button
                type="button"
                aria-label="Adicionar ao carrinho"
                class="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 text-white text-base font-bold shadow flex items-center justify-center active:scale-95 transition-all"
                @click.stop="adicionarCarrinho(V, 1)"
              >
                +
              </button>

              <div class="flex items-center justify-center bg-[#fafafa] h-32 md:h-36 p-4">
                <img class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" :src="V.img" alt="">
              </div>

              <div class="flex flex-1 flex-col gap-2 p-3">
                <h3 class="text-[12px] md:text-[13px] text-[#ccc] font-medium leading-snug line-clamp-2 min-h-[2.2rem]">
                  {{ V.nome }}
                </h3>
                <span class="mt-auto text-lg md:text-xl font-extrabold text-green-400">
                  R$ {{ V.preço }}
                </span>
              </div>
            </div>
          </DialogTrigger>

          <DialogContent class="bg-[#111] border border-[#1f1f1f] rounded-3xl p-0 md:w-120 w-[92vw] overflow-hidden">
            <div class="flex items-center justify-center bg-[#fafafa] h-60 p-6 relative">
              <span class="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                Imperdível
              </span>
              <img class="h-44 object-contain" :src="V.img" alt="">
            </div>

            <div class="px-7 py-6">
              <span class="text-[11px] text-[#555] uppercase tracking-widest font-bold">{{ V.tipo }}</span>
              <h2 class="mt-1 text-xl font-bold text-white leading-snug">
                {{ V.nome }}
              </h2>
              <p class="mt-2 text-4xl font-black text-green-400">
                R$ {{ V.preço }}
              </p>

              <div class="mt-6 flex items-center gap-3">
                <div class="flex items-center gap-1 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-1">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                    @click="diminuir(V.id)"
                  >
                    −
                  </button>
                  <span class="min-w-8 text-center font-bold text-white">{{ V.quantidade }}</span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    class="flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg hover:bg-[#2a2a2a] transition"
                    @click="aumentar(V.id)"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold py-3.5 shadow-lg shadow-red-900/30"
                  @click="produtoSelecionado = V; adicionarCarrinho(V, V.quantidade)"
                >
                  <ShoppingBasket :size="18" />
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <!-- PAGINAÇÃO -->
      <nav v-if="totalPaginas > 1" class="mt-12 flex items-center justify-center gap-1" aria-label="Paginação">
        <button
          type="button"
          aria-label="Página anterior"
          :disabled="paginaAtual === 1"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          @click="irParaPagina(paginaAtual - 1)"
        >
          <ChevronLeft :size="16" />
        </button>

        <button
          v-for="page in totalPaginas"
          :key="page"
          type="button"
          :aria-current="page === paginaAtual ? 'page' : undefined"
          class="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition"
          :class="page === paginaAtual
            ? 'bg-red-600 text-white'
            : 'border border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white'"
          @click="irParaPagina(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          aria-label="Próxima página"
          :disabled="paginaAtual === totalPaginas"
          class="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          @click="irParaPagina(paginaAtual + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </nav>
    </main>

    <Footer />
  </div>
</template>
