<script setup lang="ts">
import CarousselSobre from '~/components/Layout/CarousselSobre.vue';
import ConteudoMain from '~/components/Layout/conteudoMain.vue';
import Faqs from '~/components/Layout/Faqs.vue';
import Footer from '~/components/Layout/Footer.vue';

import HeaderMain from '~/components/Layout/HeaderMain.vue';
import MainlayoutSecundary from '~/components/Layout/MainlayoutSecundary.vue';



</script>

<template>
  <div class="flex flex-col ">

  
  <div class="fundo-alo">
    <HeaderMain class="text-gray-300 "/>

    <ConteudoMain/>

    

  </div>
  <div class="bg-[#0E0808]">
    <CarousselSobre/>
  </div>


  <div class="bg-[#0E0808]">
    <MainlayoutSecundary/>

    <Faqs/>
    <Footer/>
    

  </div>
  </div>

</template>

<style scoped>
.fundo-alo{
    background-image: url(../assets/img/bg.svg);
      background-size: cover;   
  background-position: center; 
  background-repeat: no-repeat; 
  width: 100%;
  height: 90vh; 
}
</style>
