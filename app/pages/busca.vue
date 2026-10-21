<script setup lang="ts">
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/geral"
    titulo="Busca"
    descricao="Busque entre todos os produtos do Supermercado Alô Pará, em Novo Repartimento - PA."
    gradiente="from-red-600 via-red-500 to-orange-500"
    ring="focus:ring-red-600/15"
    botao="bg-red-600 hover:bg-red-700"
    texto="text-red-500"
    badge="text-red-500"
    hover-card=""
    modo-busca
  />
</template>
