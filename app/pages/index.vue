<script setup lang="ts">
import AppBanner from '~/components/Layout/AppBanner.vue'
import CampanhasSemana from '~/components/Layout/CampanhasSemana.vue'
import CategoriasHome from '~/components/Layout/CategoriasHome.vue'
import ComoComprar from '~/components/Layout/ComoComprar.vue'
import Faqs from '~/components/Layout/Faqs.vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'
import HeroHome from '~/components/Layout/HeroHome.vue'
import PrateleiraProdutos from '~/components/Layout/PrateleiraProdutos.vue'

useSeoMeta({
  title: 'Alô Pará | Supermercado em Novo Repartimento - PA',
  description: 'Supermercado Alô Pará em Novo Repartimento - PA. Ofertas atualizadas todos os dias em alimentos, hortifruti, carnes, bebidas, limpeza e perfumaria. Compre online.',
  ogTitle: 'Supermercado Alô Pará',
  ogDescription: 'Ofertas atualizadas todos os dias. Alimentos, hortifruti, carnes, bebidas, limpeza e perfumaria com o melhor preço em Novo Repartimento - PA.',
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-(--bg-pagina)">
    <HeaderMain />

    <main>
      <HeroHome />
      <CategoriasHome />

      <!-- Produto de verdade logo no começo — é o que segura quem acabou de chegar. -->
      <PrateleiraProdutos
        titulo="Ofertas da semana"
        subtitulo="Preço de clube, enquanto durar o estoque"
        endpoint="/api/ofertas"
        link="/ofertas"
        hover-card="group-hover:bg-red-50"
      />

      <CampanhasSemana />

      <PrateleiraProdutos
        titulo="Hortifruti fresquinho"
        subtitulo="Frutas, verduras e legumes"
        endpoint="/api/frutas"
        link="/frutas"
        hover-card="group-hover:bg-lime-50"
      />

      <PrateleiraProdutos
        titulo="Carnes e frios"
        subtitulo="Bovinos, suínos, aves e frios"
        endpoint="/api/carnes"
        link="/carnes"
        hover-card="group-hover:bg-red-50"
      />

      <ComoComprar />

      <PrateleiraProdutos
        titulo="Bebidas"
        subtitulo="Sucos, refrigerantes, cervejas e mais"
        endpoint="/api/bebidas"
        link="/bebidas"
        hover-card="group-hover:bg-cyan-50"
      />

      <AppBanner />
      <Faqs />
    </main>

    <Footer />
  </div>
</template>
