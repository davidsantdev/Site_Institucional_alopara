<script setup lang="ts">
import CarousselSobre from '~/components/Layout/CarousselSobre.vue';
import ConteudoMain from '~/components/Layout/conteudoMain.vue';
import Faqs from '~/components/Layout/Faqs.vue';
import Footer from '~/components/Layout/Footer.vue';

import HeaderMain from '~/components/Layout/HeaderMain.vue';
import MainlayoutSecundary from '~/components/Layout/MainlayoutSecundary.vue';
import ProdutosRedondo from '~/components/Layout/ProdutosRedondo.vue';




</script>

<template>
  <div class="flex flex-col ">

  
  <div >
    <HeaderMain class="text-gray-300 fixed"/>

    <ConteudoMain/>

    

  </div>
  <div class="bg-[#111111] flex flex-col justify-center items-center ">
    <CarousselSobre/>



    <hr class=" border-[#222] w-[90%] m-10"/>
    <ProdutosRedondo class="m-20"/>

  </div>


  <div class="bg-[#111111]">
    
    <MainlayoutSecundary/>
    

    <Faqs />
    <Footer/>
    

  </div>
  </div>

</template>

