<script setup lang="ts">
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import LayoutTrabalho from '~/components/Layout/LayoutTrabalho.vue'

useHead({
  title: 'Trabalhe Conosco | Alô Pará',
  meta: [{ name: 'description', content: 'Faça parte da equipe do Supermercado Alô Pará. Veja nossos diferenciais e envie seu currículo.' }],
})
</script>

<template>
  <div>
    <HeaderMain />
    <LayoutTrabalho />
    <Footer />
  </div>
</template>
