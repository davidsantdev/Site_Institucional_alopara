<script setup lang="ts">
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import LayoutTrabalho from '~/components/Layout/LayoutTrabalho.vue'

useSeoMeta({
  title: 'Trabalhe Conosco | Alô Pará',
  description: 'Faça parte da equipe do Supermercado Alô Pará em Novo Repartimento - PA. Veja nossos diferenciais e envie seu currículo.',
  ogTitle: 'Trabalhe Conosco | Alô Pará',
  ogDescription: 'Faça parte da equipe do Supermercado Alô Pará. Veja nossos diferenciais e envie seu currículo.',
})
</script>

<template>
  <div>
    <HeaderMain />
    <LayoutTrabalho />
    <Footer />
  </div>
</template>
