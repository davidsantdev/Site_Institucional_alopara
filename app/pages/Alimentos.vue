<script setup lang="ts">
import { ShoppingBasket } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/alimentos"
    titulo="Alimentos & Mercearia"
    descricao="Mercearia, padaria, frios e congelados no Supermercado Alô Pará."
    gradiente="from-orange-500 via-amber-500 to-yellow-500"
    ring="focus:ring-orange-500/20"
    botao="bg-orange-700 hover:bg-orange-800"
    texto="text-orange-500"
    badge="text-orange-500"
    hover-card="group-hover:bg-orange-50"
  >
    <template #icone>
      <ShoppingBasket :size="14" />
    </template>
  </PaginaCategoria>
</template>
