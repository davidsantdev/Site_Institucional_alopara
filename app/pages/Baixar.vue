<script setup lang="ts">
import BaixarLayout from '~/components/Layout/BaixarLayout.vue';
import BaixarLayoutBottom from '~/components/Layout/baixarLayoutBottom.vue';
import Faqs from '~/components/Layout/Faqs.vue';
import Footer from '~/components/Layout/Footer.vue';
import HeaderMain from '~/components/Layout/HeaderMain.vue';

</script>

<template>
    <div>
    <div class="bg-[#A11A2D] ">
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


</style>