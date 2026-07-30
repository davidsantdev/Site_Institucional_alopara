<script setup lang="ts">
import { Frown, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { useCarrinho } from '~/data/composable/UseCarrinho'

useHead({ title: 'Meu Carrinho | Alô Pará' })

const { carrinho, removeItem, esvaziarCarrinho, totalItens } = useCarrinho()

const NUMERO_WHATSAPP = '5594991923141'

function precoItem(item: any) {
  const valor = Number.parseFloat(
    (item.preco2 ?? item.preço2 ?? item.preço ?? '0').toString().replace(',', '.'),
  )
  return (valor * (item.quantidade ?? 1)).toFixed(2).replace('.', ',')
}

const totalCarrinho = computed(() =>
  carrinho.value
    .reduce((acc, c) => {
      const valor = Number.parseFloat(
        (c.preco2 ?? c.preço2 ?? c.preço ?? '0').toString().replace(',', '.'),
      )
      return acc + valor * (c.quantidade ?? 1)
    }, 0)
    .toFixed(2)
    .replace('.', ','),
)

function aumentar(item: any) {
  item.quantidade = Math.min((item.quantidade ?? 1) + 1, 99)
}
function diminuir(item: any) {
  if ((item.quantidade ?? 1) > 1)
    item.quantidade--
}

function comprarWhatsapp() {
  const mensagem = [
    ...carrinho.value.map(item =>
      `Olá, vim pelo site\nProduto: ${item.nome}\nQuantidade: ${item.quantidade ?? 1}\nPreço: R$ ${precoItem(item)}`,
    ),
    `Total do pedido: R$ ${totalCarrinho.value}`,
  ].join('\n\n')

  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank')
}
</script>

<template>
  <div class="bg-[#F4F4F4] min-h-screen flex flex-col">
    <HeaderMain />

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10">
      <!-- HEADER -->
      <div class="flex items-center justify-between gap-3 mb-8">
        <div class="flex items-center gap-3">
          <ShoppingCart :size="28" class="text-slate-700" />
          <h1 class="text-2xl font-extrabold text-slate-800">
            Meu Carrinho
          </h1>
          <span
            v-if="carrinho.length"
            class="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ carrinho.length }}
          </span>
        </div>

        <button
          v-if="carrinho.length"
          type="button"
          class="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          @click="esvaziarCarrinho"
        >
          <Trash2 :size="14" />
          Esvaziar carrinho
        </button>
      </div>

      <!-- VAZIO -->
      <div
        v-if="totalItens.vazio"
        class="flex flex-col items-center justify-center py-28 gap-4 text-slate-400"
      >
        <Frown :size="64" class="opacity-40" />
        <p class="text-2xl font-light">
          Seu carrinho está vazio
        </p>
        <button
          type="button"
          class="mt-2 text-sm text-green-600 font-semibold hover:underline"
          @click="navigateTo('/')"
        >
          Continuar comprando →
        </button>
      </div>

      <!-- CONTEÚDO -->
      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- LISTA -->
        <div class="flex-1 flex flex-col gap-4">
          <div
            v-for="item in carrinho"
            :key="item.id ?? item.nome"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 p-4 hover:shadow-md transition-shadow"
          >
            <!-- IMG -->
            <div class="bg-slate-50 rounded-xl flex items-center justify-center md:w-28 md:h-28 w-20 h-20 flex-shrink-0 p-2">
              <img class="w-full h-full object-contain" :src="item.img" :alt="item.nome">
            </div>

            <!-- INFO -->
            <div class="flex-1 min-w-0">
              <h3 class="text-slate-800 font-semibold text-sm md:text-base leading-snug line-clamp-2">
                {{ item.nome }}
              </h3>

              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-green-600 text-xl font-extrabold">
                  R$ {{ precoItem(item) }}
                </span>
              </div>

              <!-- quantidade -->
              <div class="flex items-center gap-2 mt-3 text-black">
                <button
                  type="button"
                  :aria-label="`Diminuir quantidade de ${item.nome}`"
                  class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="(item.quantidade ?? 1) <= 1"
                  @click="diminuir(item)"
                >
                  −
                </button>
                <span class="font-bold min-w-6 text-center">{{ item.quantidade ?? 1 }}</span>
                <button
                  type="button"
                  :aria-label="`Aumentar quantidade de ${item.nome}`"
                  class="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="(item.quantidade ?? 1) >= 99"
                  @click="aumentar(item)"
                >
                  +
                </button>
              </div>
            </div>

            <!-- REMOVER -->
            <button
              type="button"
              :aria-label="`Remover ${item.nome} do carrinho`"
              class="flex-shrink-0 flex items-center gap-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              @click="removeItem(item.nome)"
            >
              <Trash2 :size="15" />
              <span class="hidden md:inline">Remover</span>
            </button>
          </div>

          <button
            type="button"
            class="self-start text-sm text-slate-500 font-semibold hover:text-slate-800 hover:underline transition-colors"
            @click="navigateTo('/')"
          >
            ← Continuar comprando
          </button>
        </div>

        <!-- RESUMO -->
        <div class="lg:w-80 w-full">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <h3 class="font-bold text-slate-800 text-lg mb-4">
              Resumo do pedido
            </h3>

            <div class="flex flex-col gap-2 mb-4">
              <div
                v-for="item in carrinho"
                :key="item.id ?? item.nome"
                class="flex justify-between text-sm text-slate-500"
              >
                <span class="truncate max-w-[60%]">{{ item.nome }} x{{ item.quantidade ?? 1 }}</span>
                <span class="font-medium text-slate-700">R$ {{ precoItem(item) }}</span>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4 mb-6">
              <div class="flex justify-between font-bold text-slate-800">
                <span>Total</span>
                <span class="text-green-600 text-xl">R$ {{ totalCarrinho }}</span>
              </div>
            </div>

            <button
              v-if="totalItens.compra"
              type="button"
              class="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] transition-all text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              @click="comprarWhatsapp"
            >
              <ShoppingCart :size="18" />
              Finalizar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
