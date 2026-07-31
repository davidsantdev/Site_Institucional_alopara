<script setup lang="ts">
import CarousselSobre from '~/components/Layout/CarousselSobre.vue'
import ConteudoMain from '~/components/Layout/conteudoMain.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import MainlayoutSecundary from '~/components/Layout/MainlayoutSecundary.vue'
import ProdutosRedondo from '~/components/Layout/ProdutosRedondo.vue'

useSeoMeta({
  title: 'Alô Pará | Supermercado em Novo Repartimento - PA',
  description: 'Supermercado Alô Pará em Novo Repartimento - PA. Ofertas atualizadas todos os dias em alimentos, bebidas, limpeza e perfumaria. Compre online.',
  ogTitle: 'Supermercado Alô Pará',
  ogDescription: 'Ofertas atualizadas todos os dias. Alimentos, bebidas, limpeza e perfumaria com o melhor preço em Novo Repartimento - PA.',
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
