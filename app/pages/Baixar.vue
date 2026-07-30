<script setup lang="ts">
import BaixarLayout from '~/components/Layout/BaixarLayout.vue'
import BaixarLayoutBottom from '~/components/Layout/baixarLayoutBottom.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'

useHead({
  title: 'Baixar App | Alô Pará',
  meta: [{ name: 'description', content: 'Baixe o aplicativo do Supermercado Alô Pará e tenha ofertas, encartes e economia direto no seu celular.' }],
})
</script>

<template>
  <div class="bg-[#111]">
    <HeaderMain />
    <BaixarLayout />
    <BaixarLayoutBottom />
    <Footer />
  </div>
</template>
