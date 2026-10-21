<script setup lang="ts">
/**
 * Card de produto das listas (categorias, Ofertas, busca, prateleiras da home
 * e "produtos similares"). O card inteiro clica pelo link do nome (o `::after`
 * dele cobre o card) — é link de verdade: abre em nova aba, o Google enxerga e
 * o "voltar" funciona. O botão de adicionar fica acima (z-10) e não navega:
 * depois do primeiro toque ele vira o contador − / + do próprio carrinho.
 */
import type { Produto } from '~/composables/useCatalogo'
import { Minus, Plus } from 'lucide-vue-next'
import { computed } from 'vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import Preco from '~/components/Layout/Preco.vue'
import { linkProduto, percentualDesconto } from '~/composables/useCatalogo'
import { formatarNome, formatarReais } from '~/composables/useFormatacao'
import { rotuloQuantidade, useCarrinho } from '~/data/composable/UseCarrinho'

const props = withDefaults(defineProps<{
  produto: Produto
  /** Classe completa (pro Tailwind enxergar) do fundo da foto no hover — vem do tema da categoria. */
  hoverCard?: string
}>(), {
  hoverCard: '',
})

const { alterarQuantidade, quantidadeDe, carregado } = useCarrinho()

const nome = computed(() => formatarNome(props.produto.nome))
const desconto = computed(() => props.produto.emPromocao ? percentualDesconto(props.produto.precoOriginal, props.produto.preco2) : 0)
const noCarrinho = computed(() => carregado.value ? quantidadeDe(props.produto.nome) : 0)
const rotulo = computed(() => rotuloQuantidade({ quantidade: noCarrinho.value, pesavel: props.produto.pesavel }))
</script>

<template>
  <article class="card group relative flex flex-col rounded-2xl border border-(--borda) bg-(--bg-cartao) p-2 transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-(--borda-forte) hover:shadow-(--sombra-2) sm:p-2.5">
    <div class="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-(--bg-foto) transition-colors duration-200" :class="hoverCard">
      <span
        v-if="desconto > 0"
        class="numeros absolute left-2 top-2 z-1 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white"
      >
        -{{ desconto }}%
      </span>
      <FotoProduto
        :produto="produto"
        img-class="h-[82%] w-[82%] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
        emoji-class="text-6xl transition-transform duration-300 group-hover:scale-110 sm:text-7xl"
      />
    </div>

    <div class="flex flex-1 flex-col px-1 pt-2.5">
      <NuxtLink
        :to="linkProduto(produto)"
        :title="nome"
        class="line-clamp-2 min-h-10 text-[13px] font-medium leading-5 text-(--texto-secundario) after:absolute after:inset-0 after:rounded-2xl sm:text-[13.5px]"
      >
        {{ nome }}
      </NuxtLink>

      <div class="mt-2 flex min-h-13 flex-col justify-end">
        <p v-if="produto.emPromocao" class="mb-1.5 flex items-center gap-1.5 text-[11px] leading-none">
          <span class="rounded bg-(--clube-fundo) px-1.5 py-0.5 font-bold uppercase tracking-wide text-(--clube)">Clube</span>
          <span class="numeros text-(--texto-fraco) line-through">R$ {{ formatarReais(produto.precoOriginal) }}</span>
        </p>
        <Preco :valor="produto.preco2" :por-kg="produto.pesavel" class="text-[22px] sm:text-2xl" />
      </div>

      <div class="relative z-10 mt-3">
        <button
          v-if="!noCarrinho"
          type="button"
          :aria-label="`Adicionar ${nome} ao carrinho`"
          class="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-(--borda-forte) bg-(--bg-cartao) text-sm font-semibold text-(--texto-primario) transition hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.97]"
          @click="alterarQuantidade(produto, 1)"
        >
          <Plus :size="16" />
          Adicionar
        </button>
        <div v-else class="flex h-10 items-center justify-between rounded-xl bg-red-600 text-white shadow-sm shadow-red-900/20">
          <button
            type="button"
            :aria-label="`Diminuir ${nome}`"
            class="grid h-10 w-10 place-items-center rounded-l-xl transition hover:bg-black/15 active:scale-90"
            @click="alterarQuantidade(produto, -1)"
          >
            <Minus :size="16" />
          </button>
          <span class="numeros text-sm font-bold" aria-live="polite">{{ rotulo }}</span>
          <button
            type="button"
            :aria-label="`Aumentar ${nome}`"
            class="grid h-10 w-10 place-items-center rounded-r-xl transition hover:bg-black/15 active:scale-90"
            @click="alterarQuantidade(produto, 1)"
          >
            <Plus :size="16" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
@keyframes surgir {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* `backwards`: depois de surgir, o card volta aos estilos normais (senão o
   transform final da animação travaria o "levanta" do hover). */
.card { animation: surgir 0.3s ease backwards; }
</style>
