<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";
import { Frown, Trash2, ShoppingCart } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";

const { carrinho, removeItem, totalItens } = useCarrinho()

function comprarWhatsapp() {
  const numero = "5594991923141"

  const mensagem = carrinho.value.map(item => `
  Ola, vim pelo site
Produto: ${item.nome}
Quantidade: ${item.quantidade ?? 1}
Preço: R$ ${precoItem(item)}
`).join("\n")

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
  window.open(url, "_blank")
}


function precoItem(item: any) {
  const valor = parseFloat((item.preço ?? item.preço2).toString().replace(',', '.'))
  return (valor * (item.quantidade ?? 1)).toFixed(2).replace('.', ',')
}


const totalCarrinho = computed(() =>
  carrinho.value
    .reduce((acc, c) => {
      const valor = parseFloat((c.preço ?? c.preço2).toString().replace(',', '.'))
      return acc + valor * (c.quantidade ?? 1)
    }, 0)
    .toFixed(2)
    .replace('.', ',')
)
</script>

<template>
<div class="bg-[#F4F4F4] min-h-screen flex flex-col">
  <HeaderMain/>

  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10">

    <!-- HEADER -->
    <div class="flex items-center gap-3 mb-8">
      <ShoppingCart :size="28" class="text-slate-700"/>
      <h2 class="text-2xl font-extrabold text-slate-800">Meu Carrinho</h2>

      <span v-if="carrinho.length"
        class="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {{ carrinho.length }}
      </span>
    </div>

    <!-- VAZIO -->
    <div v-if="totalItens.vazio"
      class="flex flex-col items-center justify-center py-28 gap-4 text-slate-400">
      <Frown :size="64" class="opacity-40"/>
      <p class="text-2xl font-light">Seu carrinho está vazio</p>
      <button @click="navigateTo('/')"
        class="mt-2 text-sm text-green-600 font-semibold hover:underline">
        Continuar comprando →
      </button>
    </div>

    <!-- CONTEÚDO -->
    <div v-else class="flex flex-col lg:flex-row gap-8">

      <!-- LISTA -->
      <div class="flex-1 flex flex-col gap-4">

        <div v-for="C in carrinho" :key="C.id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm
          flex items-center gap-4 p-4 hover:shadow-md transition-shadow">

          <!-- IMG -->
          <div class="bg-slate-50 rounded-xl flex items-center justify-center
            md:w-28 md:h-28 w-20 h-20 flex-shrink-0 p-2">
            <img class="w-full h-full object-contain" :src="C.img" alt="">
          </div>

          <!-- INFO -->
          <div class="flex-1 min-w-0">
            <h3 class="text-slate-800 font-semibold text-sm md:text-base leading-snug line-clamp-2">
              {{ C.nome }}
            </h3>

            <div class="flex items-baseline gap-2 mt-2">
              <span class="text-green-600 text-xl font-extrabold">
                R$ {{ precoItem(C) }}
              </span>

              <span v-if="C.preço1"
                class="text-slate-400 text-sm line-through">
                R$ {{ C.preço1 }}
              </span>
            </div>

            <!-- 🔥 quantidade -->
            <div class="flex items-center gap-2 mt-3 text-black">
              <button @click="C.quantidade > 1 && C.quantidade--"
                class="px-2 py-1 rounded">-</button>

              <span class="font-bold">{{ C.quantidade ?? 1 }}</span>

              <button @click="C.quantidade = (C.quantidade ?? 1) + 1"
                class="px-2 py-1  rounded">+</button>
            </div>
          </div>

          <!-- REMOVER -->
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

          <h3 class="font-bold text-slate-800 text-lg mb-4">
            Resumo do pedido
          </h3>

          <div class="flex flex-col gap-2 mb-4">
            <div v-for="C in carrinho" :key="C.id"
              class="flex justify-between text-sm text-slate-500">

              <span class="truncate max-w-[60%]">
                {{ C.nome }} x{{ C.quantidade ?? 1 }}
              </span>

              <span class="font-medium text-slate-700">
                R$ {{ precoItem(C) }}
              </span>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 mb-6">
            <div class="flex justify-between font-bold text-slate-800">
              <span>Total</span>
              <span class="text-green-600 text-xl">
                R$ {{ totalCarrinho }}
              </span>
            </div>
          </div>

          <button
            v-if="totalItens.compra"
            @click="comprarWhatsapp()"
            class="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98]
            transition-all text-white font-bold text-base py-4 rounded-xl
            shadow-lg shadow-green-200 flex items-center justify-center gap-2">

            <ShoppingCart :size="18"/>
            Finalizar no WhatsApp
          </button>

        </div>
      </div>

    </div>
  </main>

  <Footer/>
</div>
</template>