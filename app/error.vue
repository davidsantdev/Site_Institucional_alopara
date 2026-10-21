<script setup lang="ts">
import type { NuxtError } from '#app'
import { Home, RotateCcw, SearchX, TriangleAlert } from 'lucide-vue-next'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import { CATEGORIAS_LOJA } from '~/composables/useNavegacao'

const props = defineProps<{ error: NuxtError }>()

const e404 = props.error.statusCode === 404

useHead({
  title: e404 ? 'Página não encontrada | Alô Pará' : 'Erro | Alô Pará',
})

function voltarAoInicio() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-(--bg-pagina) font-sans">
    <HeaderMain />

    <main class="flex flex-1 items-center justify-center px-4 py-20">
      <div class="max-w-lg text-center">
        <span class="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-(--marca-suave) text-red-600">
          <component :is="e404 ? SearchX : TriangleAlert" :size="34" />
        </span>
        <p class="numeros mt-6 text-sm font-semibold text-(--texto-fraco)">
          Erro {{ error.statusCode }}
        </p>
        <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-(--texto-primario)">
          {{ e404 ? 'Essa página saiu de linha' : 'Algo deu errado' }}
        </h1>
        <p class="mt-2 text-(--texto-fraco)">
          {{ e404
            ? 'O produto ou a página que você procura não existe ou foi movida.'
            : 'Não conseguimos carregar essa página agora. Tente novamente em instantes.' }}
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex h-12 items-center gap-2 rounded-full bg-red-600 px-6 font-semibold text-white shadow-sm shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.97]"
            @click="voltarAoInicio"
          >
            <Home :size="18" />
            Voltar à página inicial
          </button>
          <button
            v-if="!e404"
            type="button"
            class="inline-flex h-12 items-center gap-2 rounded-full border border-(--borda-forte) bg-(--bg-cartao) px-6 font-semibold text-(--texto-primario) transition hover:border-(--borda-hover) active:scale-[0.97]"
            @click="() => $router.go(0)"
          >
            <RotateCcw :size="18" />
            Tentar de novo
          </button>
        </div>

        <div v-if="e404" class="mt-10 flex flex-wrap justify-center gap-2">
          <NuxtLink
            v-for="c in CATEGORIAS_LOJA"
            :key="c.rota"
            :to="c.rota"
            class="inline-flex items-center gap-2 rounded-full border border-(--borda-forte) bg-(--bg-cartao) px-4 py-2 text-sm font-medium text-(--texto-secundario) transition hover:border-red-600 hover:text-red-600"
          >
            <component :is="c.icone" :size="15" />
            {{ c.label }}
          </NuxtLink>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
