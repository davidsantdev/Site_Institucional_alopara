<script setup lang="ts">
import { Beef } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/carnes"
    titulo="Carnes & Aves"
    descricao="Açougue — bovinos, suínos, aves e frios no Supermercado Alô Pará."
    gradiente="from-red-800 via-rose-700 to-orange-800"
    ring="focus:ring-red-700/50"
    botao="bg-red-800 hover:bg-red-900"
    texto="text-red-500"
    badge="text-rose-500"
    hover-card="group-hover:bg-red-50"
  >
    <template #icone>
      <Beef :size="14" />
    </template>
  </PaginaCategoria>
</template>
