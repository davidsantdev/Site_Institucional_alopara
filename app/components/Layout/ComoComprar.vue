<script setup lang="ts">
/**
 * O pedido fecha no WhatsApp, não num checkout — não é o que a pessoa espera
 * de uma loja online, então vale explicar o caminho em três passos.
 */
import { MessageCircle, Search, ShoppingCart } from 'lucide-vue-next'

const passos = [
  { icone: Search, titulo: 'Escolha os produtos', texto: 'Navegue pelas categorias ou use a busca lá em cima.' },
  { icone: ShoppingCart, titulo: 'Monte o carrinho', texto: 'Ajuste as quantidades — no hortifruti você escolhe em gramas.' },
  { icone: MessageCircle, titulo: 'Finalize no WhatsApp', texto: 'A lista vai pronta pra nossa equipe confirmar tudo com você.' },
]
</script>

<template>
  <section aria-labelledby="titulo-como-comprar" class="mx-auto w-full max-w-7xl px-4 pt-14 md:px-6 md:pt-20 lg:px-8">
    <div class="rounded-3xl border border-(--borda) bg-(--bg-cartao) p-6 md:p-10">
      <div class="max-w-xl">
        <p class="text-sm font-semibold text-red-600">
          Como comprar
        </p>
        <h2 id="titulo-como-comprar" class="mt-1.5 text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
          Seu pedido em três passos
        </h2>
      </div>

      <ol class="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
        <li v-for="(p, i) in passos" :key="p.titulo" class="relative flex gap-4 rounded-2xl bg-(--bg-pagina) p-5">
          <span class="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-md shadow-red-900/20">
            <component :is="p.icone" :size="21" />
            <span class="numeros absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-(--texto-primario) text-xs font-bold text-(--bg-pagina) ring-2 ring-(--bg-pagina)">{{ i + 1 }}</span>
          </span>
          <span>
            <span class="block font-semibold text-(--texto-primario)">{{ p.titulo }}</span>
            <span class="mt-1 block text-sm leading-relaxed text-(--texto-fraco)">{{ p.texto }}</span>
          </span>
        </li>
      </ol>
    </div>
  </section>
</template>
