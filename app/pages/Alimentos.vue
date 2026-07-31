<script setup lang="ts">
import { Flame } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/alimentos"
    titulo="Alimentos & Mercearia"
    descricao="Mercearia, hortifruti, padaria, frios e congelados no Supermercado Alô Pará."
    gradiente="from-red-600 via-red-500 to-orange-500"
    ring="focus:ring-red-500/50"
    botao="bg-red-500 hover:bg-red-600"
    texto="text-red-400"
    badge="text-orange-400"
    hover-card="group-hover:bg-red-50"
  >
    <template #icone>
      <Flame :size="14" />
    </template>
  </PaginaCategoria>
</template>
