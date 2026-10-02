<script setup lang="ts">
/**
 * Vitrine de ofertas DE VERDADE na home — antes só tinha um carrossel de
 * banners decorativos ali (ver CarousselSobre, que virou "Encartes da
 * semana" e foi pra baixo). Produto real, preço real, direto do catálogo.
 *
 * `/` é pré-renderizada em build (ver routeRules em nuxt.config.ts) — se
 * isto buscasse os produtos com useFetch normal, o preço/estoque ficaria
 * congelado na hora do `npm run build` e nunca mais atualizaria sozinho até
 * o próximo deploy. `server: false` força a busca a acontecer só no
 * navegador de cada visita, sempre fresca.
 */
import type { Produto } from '~/composables/useCatalogo'
import { ChevronRight, Tag } from 'lucide-vue-next'
import { computed } from 'vue'
import CardProduto from '~/components/Layout/CardProduto.vue'

const LIMITE = 12

const { data, status } = await useFetch<{ produtos: Produto[] }>('/api/ofertas', {
  query: { pagina: 1 },
  server: false,
})

const produtos = computed(() => (data.value?.produtos ?? []).slice(0, LIMITE))
</script>

<template>
  <!-- Sem oferta nenhuma pra mostrar (ou erro): a seção inteira some, não deixa título órfão. -->
  <section
    v-if="status === 'idle' || status === 'pending' || produtos.length"
    class="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-14"
  >
    <div class="flex items-center justify-between gap-4 mb-6 md:mb-10">
      <div class="flex items-center gap-4">
        <span class="inline-flex items-center gap-1.5 text-red-600 text-[10px] font-black tracking-[4px] uppercase">
          <Tag :size="12" />
          Ofertas da semana
        </span>
        <div class="flex-1 h-px bg-(--borda)" />
      </div>
      <NuxtLink
        to="/ofertas"
        class="hidden sm:flex shrink-0 items-center gap-0.5 text-[11px] font-bold tracking-[1.5px] uppercase text-(--texto-suave) hover:text-red-500 transition-colors"
      >
        Ver todas
        <ChevronRight :size="14" />
      </NuxtLink>
    </div>

    <div v-if="status === 'idle' || status === 'pending'" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
      <div
        v-for="n in 6"
        :key="n"
        class="flex flex-col overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao)"
      >
        <div class="h-36 animate-pulse bg-(--bg-elevado)" />
        <div class="flex flex-col gap-2 p-3">
          <div class="h-3 w-full animate-pulse rounded bg-(--borda)" />
          <div class="h-3 w-3/4 animate-pulse rounded bg-(--borda)" />
          <div class="mt-1 h-5 w-1/2 animate-pulse rounded bg-(--borda)" />
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
      <CardProduto
        v-for="produto in produtos"
        :key="produto.id"
        :produto="produto"
        hover-card="group-hover:bg-emerald-50"
      />
    </div>

    <NuxtLink
      to="/ofertas"
      class="mt-6 flex items-center justify-center gap-1 rounded-xl border border-(--borda-forte) py-3 text-xs font-bold uppercase tracking-wide text-(--texto-secundario) transition-colors hover:border-red-600 hover:text-red-500 sm:hidden"
    >
      Ver todas as ofertas
      <ChevronRight :size="14" />
    </NuxtLink>
  </section>
</template>
