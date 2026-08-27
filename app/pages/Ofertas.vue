<script setup lang="ts">
import { Tag } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/ofertas"
    titulo="Ofertas do Clube"
    descricao="Produtos com preço de clube ativo no Supermercado Alô Pará, em Novo Repartimento - PA."
    gradiente="from-emerald-600 via-emerald-500 to-teal-500"
    ring="focus:ring-emerald-500/50"
    botao="bg-emerald-500 hover:bg-emerald-600"
    texto="text-emerald-400"
    badge="text-emerald-400"
    hover-card="group-hover:bg-emerald-50"
  >
    <template #icone>
      <Tag :size="14" />
    </template>
  </PaginaCategoria>
</template>
