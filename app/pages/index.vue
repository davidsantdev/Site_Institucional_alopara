<script setup lang="ts">
import CarousselSobre from '~/components/Layout/CarousselSobre.vue'
import ConteudoMain from '~/components/Layout/conteudoMain.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import MainlayoutSecundary from '~/components/Layout/MainlayoutSecundary.vue'
import OfertasHome from '~/components/Layout/OfertasHome.vue'
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

    <!-- Produto de verdade primeiro (ofertas reais, puxadas do catálogo) — é o
         que mais segura quem acabou de chegar. Categorias e o carrossel de
         encartes (imagem decorativa, sem preço) vêm depois, já com a pessoa
         tendo visto produto de verdade na tela. -->
    <div class="bg-(--bg-pagina) flex flex-col justify-center items-center">
      <OfertasHome />
      <hr class="border-[#222] w-[90%] m-10">
      <ProdutosRedondo />
      <hr class="border-[#222] w-[90%] m-10">
      <CarousselSobre />
    </div>

    <div class="bg-(--bg-pagina)">
      <MainlayoutSecundary />
      <Footer />
    </div>
  </div>
</template>
