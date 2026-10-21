<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import PaginaCategoria from '~/components/Layout/PaginaCategoria.vue'
</script>

<template>
  <PaginaCategoria
    endpoint="/api/higiene"
    titulo="Perfumaria & Beleza"
    descricao="Cabelos, cosméticos, cuidados pessoais, bebê e higiene no Supermercado Alô Pará."
    gradiente="from-pink-500 via-rose-400 to-fuchsia-500"
    ring="focus:ring-pink-400/20"
    botao="bg-pink-600 hover:bg-pink-700"
    texto="text-pink-400"
    badge="text-pink-400"
    hover-card="group-hover:bg-pink-50"
  >
    <template #icone>
      <Sparkles :size="14" />
    </template>
  </PaginaCategoria>
</template>
