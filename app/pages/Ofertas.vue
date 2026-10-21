<script setup lang="ts">
import { Tag } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/ofertas"
    titulo="Ofertas do Clube"
    descricao="Produtos com preço de clube ativo no Supermercado Alô Pará, em Novo Repartimento - PA."
    gradiente="from-red-600 via-red-500 to-orange-500"
    ring="focus:ring-red-500/20"
    botao="bg-red-600 hover:bg-red-700"
    texto="text-red-500"
    badge="text-red-500"
    hover-card="group-hover:bg-red-50"
  >
    <template #icone>
      <Tag :size="14" />
    </template>
  </PaginaCategoria>
</template>
