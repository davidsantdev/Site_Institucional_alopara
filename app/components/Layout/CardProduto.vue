<script setup lang="ts">
/**
 * Card de produto das listas (categorias, Ofertas) e dos "produtos similares"
 * da página do produto. O card inteiro clica pelo link do nome (o `::after`
 * dele cobre o card) — é link de verdade: abre em nova aba, o Google enxerga
 * e o "voltar" do navegador funciona. O "+" fica acima (z-10) e não navega.
 */
import type { Produto } from '~/composables/useCatalogo'
import { computed } from 'vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import { linkProduto, percentualDesconto } from '~/composables/useCatalogo'
import { formatarPeso, PESO, useCarrinho } from '~/data/composable/UseCarrinho'

const props = withDefaults(defineProps<{
  produto: Produto
  /** Classe completa (pro Tailwind enxergar) do fundo da foto no hover — vem do tema da categoria. */
  hoverCard?: string
}>(), {
  hoverCard: 'group-hover:bg-red-50',
})

const { adicionarCarrinho } = useCarrinho()

/** Produto pesado entra com 500 g (dá pra mudar na página do produto e no carrinho); o resto entra com 1. */
const quantidadeRapida = computed(() => props.produto.pesavel ? PESO.PADRAO_GRAMAS / 1000 : 1)

function adicionarRapido() {
  adicionarCarrinho(props.produto, quantidadeRapida.value)
}
</script>

<template>
  <div class="card group relative flex flex-col overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--borda-hover)">
    <span
      v-if="produto.emPromocao"
      class="absolute left-2 top-2 z-10 rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow"
    >
      -{{ percentualDesconto(produto.precoOriginal, produto.preco2) }}%
    </span>

    <button
      type="button"
      :aria-label="produto.pesavel ? `Adicionar ${formatarPeso(quantidadeRapida)} de ${produto.nome} ao carrinho` : `Adicionar ${produto.nome} ao carrinho`"
      class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-base font-bold text-white shadow transition-all hover:bg-green-600 active:scale-95"
      @click="adicionarRapido"
    >
      +
    </button>

    <div class="flex h-36 items-center justify-center bg-[#fafafa] p-3 transition-colors duration-200" :class="hoverCard">
      <FotoProduto
        :produto="produto"
        img-class="h-28 w-28 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        emoji-class="text-7xl transition-transform duration-200 group-hover:scale-110"
      />
    </div>

    <div class="flex flex-1 flex-col gap-1 p-3 pt-2">
      <NuxtLink
        :to="linkProduto(produto)"
        class="line-clamp-2 min-h-10 text-[12px] font-medium leading-snug text-(--texto-secundario) after:absolute after:inset-0 after:z-1 md:text-[13px]"
      >
        {{ produto.nome }}
      </NuxtLink>

      <div class="mt-auto pt-1">
        <template v-if="produto.emPromocao">
          <p class="text-[10px] leading-tight text-(--texto-fraco)">
            Preço normal: <span class="line-through">R$ {{ produto.precoOriginal }}</span>{{ produto.pesavel ? '/kg' : '' }}
          </p>
          <p class="leading-tight">
            <span class="block text-[9px] font-black uppercase tracking-wide text-emerald-500">Preço do clube</span>
            <span class="text-xl font-extrabold text-(--preco) md:text-2xl">R$ {{ produto.preco2 }}</span>
            <span v-if="produto.pesavel" class="ml-0.5 text-xs font-bold text-(--texto-fraco)">/kg</span>
          </p>
        </template>
        <p v-else class="leading-tight">
          <span class="text-xl font-extrabold text-(--preco) md:text-2xl">R$ {{ produto.preco2 }}</span>
          <span v-if="produto.pesavel" class="ml-0.5 text-xs font-bold text-(--texto-fraco)">/kg</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeIn 0.25s ease both; }

@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }
}
</style>
