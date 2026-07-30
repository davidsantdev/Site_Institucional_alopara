<script setup lang="ts">
import CarousselSobre from '~/components/Layout/CarousselSobre.vue'
import ConteudoMain from '~/components/Layout/conteudoMain.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import MainlayoutSecundary from '~/components/Layout/MainlayoutSecundary.vue'
import ProdutosRedondo from '~/components/Layout/ProdutosRedondo.vue'

useHead({
  title: 'Alô Pará | Você no coração da gente',
  meta: [{ name: 'description', content: 'Confira as melhores ofertas do Supermercado Alô Pará. Promoções atualizadas todos os dias!' }],
})
</script>

<template>
  <div class="flex flex-col">
    <HeaderMain />
    <ConteudoMain />

    <div class="bg-[#111111] flex flex-col justify-center items-center">
      <CarousselSobre />
      <hr class="border-[#222] w-[90%] m-10">
      <ProdutosRedondo class="m-20" />
    </div>

    <div class="bg-[#111111]">
      <MainlayoutSecundary />
      <Footer />
    </div>
  </div>
</template>
