<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import { Frown, Trash2, ShoppingCart } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";

const { carrinho, removeItem, totalItens } = useCarrinho()

function comprarWhatsapp() {
  const numero = "5594991923141"
  const mensagem = `
${carrinho.value.map(item => `
Produto: ${item.nome}
Preço: R$ ${item.preço ?? item.preço2}
`).join("\n")}
  `
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
  window.open(url, "_blank")
}
</script>

<template>
<div class="bg-[#F4F4F4] min-h-screen flex flex-col">
  <HeaderMain/>

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10">

    <!-- HEADER DA PÁGINA -->
    <div class="flex items-center gap-3 mb-8">
      <ShoppingCart :size="28" class="text-slate-700"/>
      <h2 class="text-2xl font-extrabold text-slate-800">Meu Carrinho</h2>
      <span v-if="carrinho.length" class="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {{ carrinho.length }}
      </span>
    </div>

    <!-- CARRINHO VAZIO -->
    <div v-if="totalItens.vazio"
      class="flex flex-col items-center justify-center py-28 gap-4 text-slate-400">
      <Frown :size="64" class="opacity-40"/>
      <p class="text-2xl font-light">Seu carrinho está vazio</p>
      <button @click="navigateTo('/')"
        class="mt-2 text-sm text-green-600 font-semibold hover:underline">
        Continuar comprando →
      </button>
    </div>

    <!-- GRID DE PRODUTOS -->
    <div v-else class="flex flex-col lg:flex-row gap-8">

      <!-- LISTA -->
      <div class="flex-1 flex flex-col gap-4">
        <div v-for="C in carrinho" :key="C.id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm
          flex items-center gap-4 p-4 hover:shadow-md transition-shadow">

          <!-- Imagem -->
          <div class="bg-slate-50 rounded-xl flex items-center justify-center
            md:w-28 md:h-28 w-20 h-20 flex-shrink-0 p-2">
            <img class="w-full h-full object-contain" :src="C.img" alt="">
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-slate-800 font-semibold text-sm md:text-base leading-snug line-clamp-2">
              {{ C.nome }}
            </h3>
            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-green-600 text-xl font-extrabold">
                R$ {{ C.preço ?? C.preço2 }}
              </span>
              <span v-if="C.preço1" class="text-slate-400 text-sm line-through">
                R$ {{ C.preço1 }}
              </span>
            </div>
          </div>

          <!-- Remover -->
          <button @click="removeItem(C.nome)"
            class="flex-shrink-0 flex items-center gap-1.5 text-red-400 hover:text-red-600
            hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Trash2 :size="15"/>
            <span class="hidden md:inline">Remover</span>
          </button>

        </div>
      </div>

      <!-- RESUMO -->
      <div class="lg:w-80 w-full">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
          <h3 class="font-bold text-slate-800 text-lg mb-4">Resumo do pedido</h3>

          <div class="flex flex-col gap-2 mb-4">
            <div v-for="C in carrinho" :key="C.id"
              class="flex justify-between text-sm text-slate-500">
              <span class="truncate max-w-[60%]">{{ C.nome }}</span>
              <span class="font-medium text-slate-700">R$ {{ C.preço ?? C.preço2 }}</span>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 mb-6">
            <div class="flex justify-between font-bold text-slate-800">
              <span>Total</span>
              <span class="text-green-600 text-xl">
                R$ {{ carrinho.reduce((acc, c) => acc + parseFloat((c.preço ?? c.preço2).toString().replace(',', '.')), 0).toFixed(2).replace('.', ',') }}
              </span>
            </div>
          </div>

          <button
            v-if="totalItens.compra"
            @click="comprarWhatsapp()"
            class="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98]
            transition-all text-white font-bold text-base py-4 rounded-xl
            shadow-lg shadow-green-200 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Finalizar no WhatsApp
          </button>
        </div>
      </div>

    </div>
  </main>

  <Footer class="mt-100"/>
</div>
</template>