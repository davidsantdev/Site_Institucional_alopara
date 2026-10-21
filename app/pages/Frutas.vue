<script setup lang="ts">
import { Apple } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/frutas"
    titulo="Frutas & Verduras"
    descricao="Hortifruti fresco — frutas, verduras e legumes no Supermercado Alô Pará."
    gradiente="from-lime-500 via-green-500 to-emerald-600"
    ring="focus:ring-lime-400/50"
    botao="bg-lime-500 hover:bg-lime-600"
    texto="text-lime-500"
    badge="text-emerald-500"
    hover-card="group-hover:bg-lime-50"
  >
    <template #icone>
      <Apple :size="14" />
    </template>
  </PaginaCategoria>
</template>
