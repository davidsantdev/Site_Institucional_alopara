<script setup lang="ts">
import { SprayCan } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/limpeza"
    titulo="Limpeza & Higiene"
    descricao="Produtos de limpeza, lavanderia, descartáveis e utilidades no Supermercado Alô Pará."
    gradiente="from-blue-600 via-blue-500 to-cyan-400"
    ring="focus:ring-blue-400/20"
    botao="bg-blue-600 hover:bg-blue-700"
    texto="text-blue-400"
    badge="text-blue-400"
    hover-card="group-hover:bg-blue-50"
  >
    <template #icone>
      <SprayCan :size="14" />
    </template>
  </PaginaCategoria>
</template>
