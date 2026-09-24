<script setup lang="ts">
import { Frown, ShoppingCart, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { obterCodigoAfiliado } from '~/composables/useAfiliado'
import { PESO, precoUnitario, rotuloQuantidade, subtotalItem, useCarrinho } from '~/data/composable/UseCarrinho'

useSeoMeta({
  title: 'Meu Carrinho | Alô Pará',
  robots: 'noindex, follow',
})

const { carrinho, removeItem, esvaziarCarrinho, totalItens } = useCarrinho()

const NUMERO_WHATSAPP = '5594991923141'

/** 6.9 → "6,90" (o carrinho mostra com vírgula). */
function formatarReais(valor: number) {
  return valor.toFixed(2).replace('.', ',')
}

/** Quanto custa o item inteiro (produto pesado: preço/kg × kg). */
function precoItem(item: any) {
  return formatarReais(subtotalItem(item))
}

// Soma em centavos inteiros — somar reais em ponto flutuante errava o centavo.
const totalCarrinho = computed(() =>
  formatarReais(carrinho.value.reduce((acc, c) => acc + Math.round(subtotalItem(c) * 100), 0) / 100),
)

function aumentar(item: any) {
  if (item.pesavel)
    item.quantidade = Math.min(Math.round((item.quantidade + PESO.PASSO_GRAMAS / 1000) * 1000) / 1000, PESO.MAX_GRAMAS / 1000)
  else
    item.quantidade = Math.min((item.quantidade ?? 1) + 1, 99)
}
function diminuir(item: any) {
  if (item.pesavel)
    item.quantidade = Math.max(Math.round((item.quantidade - PESO.PASSO_GRAMAS / 1000) * 1000) / 1000, PESO.MIN_GRAMAS / 1000)
  else if ((item.quantidade ?? 1) > 1)
    item.quantidade--
}
/** O botão − / + trava no limite: peso não passa de 20 kg nem cai de 50 g; o resto, de 1 a 99. */
function noMinimo(item: any) {
  return item.pesavel ? item.quantidade <= PESO.MIN_GRAMAS / 1000 : (item.quantidade ?? 1) <= 1
}
function noMaximo(item: any) {
  return item.pesavel ? item.quantidade >= PESO.MAX_GRAMAS / 1000 : (item.quantidade ?? 1) >= 99
}

function comprarWhatsapp() {
  const valorTotal = Number(totalCarrinho.value.replace(',', '.')) || 0
  const itensGA = carrinho.value.map(item => ({
    item_id: String(item.id ?? item.nome),
    item_name: item.nome,
    price: precoUnitario(item),
    quantity: item.quantidade ?? 1,
  }))

  const { gtag } = useGtag()
  // 'finalizar_whatsapp' é o evento de sempre (mantido pro que já estava
  // configurado no GA4); 'begin_checkout' é o nome padrão que o relatório
  // de Monetização do Analytics reconhece sozinho — sem ele, o valor não
  // aparecia lá mesmo o evento sendo disparado.
  gtag('event', 'finalizar_whatsapp', {
    value: valorTotal,
    currency: 'BRL',
    quantidade_itens: carrinho.value.length,
    items: itensGA,
  })
  gtag('event', 'begin_checkout', {
    value: valorTotal,
    currency: 'BRL',
    items: itensGA,
  })

  const itens = carrinho.value
    .map((item, i) => `${i + 1}. ${item.nome}\n   Quantidade: ${item.quantidade ?? 1} — R$ ${precoItem(item)}`)
    .join('\n\n')

  // Se a pessoa chegou por um link de indicação, o código vai junto na
  // mensagem — é assim que o atendente sabe que veio de um afiliado, já
  // que o pedido inteiro fecha por aqui, fora de qualquer sistema.
  const codigoAfiliado = obterCodigoAfiliado()

  const mensagem = [
    'Olá, vim pelo site! Gostaria de fazer o seguinte pedido:',
    itens,
    `Total do pedido: R$ ${totalCarrinho.value}`,
    ...(codigoAfiliado ? [`Código de indicação: ${codigoAfiliado}`] : []),
  ].join('\n\n')

  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank')
}
</script>

<template>
  <div class="bg-(--bg-pagina) min-h-screen flex flex-col">
    <HeaderMain />

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-10">
      <div class="flex items-center justify-between gap-3 mb-8">
        <div class="flex items-center gap-3">
          <ShoppingCart :size="24" class="text-red-600" />
          <h1 class="text-(--texto-primario) text-[22px] md:text-2xl font-black tracking-tight">
            Meu Carrinho
          </h1>
          <span
            v-if="carrinho.length"
            class="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full"
          >
            {{ carrinho.length }}
          </span>
        </div>

        <button
          v-if="carrinho.length"
          type="button"
          class="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-(--texto-suave) hover:text-red-500 transition-colors"
          @click="esvaziarCarrinho"
        >
          <Trash2 :size="14" />
          Esvaziar carrinho
        </button>
      </div>

      <div
        v-if="totalItens.vazio"
        class="flex flex-col items-center justify-center py-28 gap-4 text-(--texto-minimo)"
      >
        <Frown :size="64" class="opacity-40" />
        <p class="text-xl md:text-2xl font-light text-(--texto-esmaecido)">
          Seu carrinho está vazio
        </p>
        <button
          type="button"
          class="mt-2 text-sm text-red-500 font-semibold hover:text-red-400 hover:underline transition-colors"
          @click="navigateTo('/')"
        >
          Continuar comprando →
        </button>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 flex flex-col gap-3">
          <div
            v-for="item in carrinho"
            :key="item.id ?? item.nome"
            class="bg-(--bg-cartao) rounded-2xl border border-(--borda) flex items-center gap-4 p-4 hover:border-(--borda-forte) transition-colors"
          >
            <div class="bg-[#fafafa] rounded-xl flex items-center justify-center md:w-28 md:h-28 w-20 h-20 flex-shrink-0 p-2">
              <FotoProduto
                :produto="item"
                img-class="w-full h-full object-contain"
                emoji-class="text-5xl md:text-7xl"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-(--texto-primario) font-semibold text-sm md:text-base leading-snug line-clamp-2">
                {{ item.nome }}
              </h3>

              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-(--preco) text-xl font-extrabold">
                  R$ {{ precoItem(item) }}
                </span>
                <span v-if="item.pesavel" class="text-xs text-(--texto-fraco)">
                  R$ {{ formatarReais(precoUnitario(item)) }}/kg
                </span>
              </div>

              <div class="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  :aria-label="`Diminuir quantidade de ${item.nome}`"
                  class="w-7 h-7 flex items-center justify-center rounded-lg border border-(--borda-forte) text-(--texto-primario) hover:bg-(--bg-elevado) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="noMinimo(item)"
                  @click="diminuir(item)"
                >
                  −
                </button>
                <span class="font-bold text-center text-(--texto-primario)" :class="item.pesavel ? 'min-w-14' : 'min-w-6'">{{ rotuloQuantidade(item) }}</span>
                <button
                  type="button"
                  :aria-label="`Aumentar quantidade de ${item.nome}`"
                  class="w-7 h-7 flex items-center justify-center rounded-lg border border-(--borda-forte) text-(--texto-primario) hover:bg-(--bg-elevado) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  :disabled="noMaximo(item)"
                  @click="aumentar(item)"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              :aria-label="`Remover ${item.nome} do carrinho`"
              class="flex-shrink-0 flex items-center gap-1.5 text-(--texto-suave) hover:text-red-500 hover:bg-red-500/10 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              @click="removeItem(item.nome)"
            >
              <Trash2 :size="15" />
              <span class="hidden md:inline">Remover</span>
            </button>
          </div>

          <button
            type="button"
            class="self-start text-sm text-(--texto-suave) font-semibold hover:text-(--texto-primario) transition-colors mt-2"
            @click="navigateTo('/')"
          >
            ← Continuar comprando
          </button>
        </div>

        <div class="lg:w-80 w-full">
          <div class="bg-(--bg-cartao) rounded-2xl border border-(--borda) p-6 sticky top-24">
            <h3 class="font-black text-(--texto-primario) text-lg mb-4 tracking-tight">
              Resumo do pedido
            </h3>

            <div class="flex flex-col gap-2 mb-4">
              <div
                v-for="item in carrinho"
                :key="item.id ?? item.nome"
                class="flex justify-between text-sm text-(--texto-fraco)"
              >
                <span class="truncate max-w-[60%]">{{ item.nome }} x{{ rotuloQuantidade(item) }}</span>
                <span class="font-medium text-(--texto-secundario)">R$ {{ precoItem(item) }}</span>
              </div>
            </div>

            <div class="border-t border-(--borda) pt-4 mb-6">
              <div class="flex justify-between font-bold text-(--texto-primario)">
                <span>Total</span>
                <span class="text-(--preco) text-xl">R$ {{ totalCarrinho }}</span>
              </div>
            </div>

            <button
              v-if="totalItens.compra"
              type="button"
              class="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all text-white font-bold text-base py-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
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
