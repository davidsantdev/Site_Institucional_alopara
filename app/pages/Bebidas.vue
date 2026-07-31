<script setup lang="ts">
import { GlassWater } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/bebidas"
    titulo="Bebidas"
    descricao="Sucos, refrigerantes, cervejas, águas e destilados no Supermercado Alô Pará."
    gradiente="from-cyan-500 via-sky-500 to-blue-600"
    ring="focus:ring-cyan-400/50"
    botao="bg-cyan-500 hover:bg-cyan-600"
    texto="text-cyan-400"
    badge="text-cyan-400"
    hover-card="group-hover:bg-cyan-50"
  >
    <template #icone>
      <GlassWater :size="14" />
    </template>
  </PaginaCategoria>
</template>
