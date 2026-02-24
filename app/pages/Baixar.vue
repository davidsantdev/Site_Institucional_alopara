<script setup lang="ts">
import BaixarLayout from '~/components/Layout/BaixarLayout.vue';
import BaixarLayoutBottom from '~/components/Layout/baixarLayoutBottom.vue';
import Faqs from '~/components/Layout/Faqs.vue';
import Footer from '~/components/Layout/Footer.vue';
import HeaderMain from '~/components/Layout/HeaderMain.vue';

</script>

<template>
    <div>
    <div class="fundo-baixar">
        <HeaderMain class="text-gray-300 "></HeaderMain>
        <BaixarLayout/>
    </div>
    <div class="bg-[#A11A2D]">
        <BaixarLayoutBottom/>

    </div>
      <Faqs/>
    <Footer/>
    </div>
</template>

<style scoped>
.fundo-baixar{
    background-image: url(../assets/img/ok.jpg);
      background-size: cover;   /* cobre toda a div */
  background-position: center; /* centraliza */
  background-repeat: no-repeat; /* não repete a imagem */
  width: 100%;
  height: 95vh; /* ocupa toda a altura da tela */
}
</style>