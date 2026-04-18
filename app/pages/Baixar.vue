<script setup lang="ts">
import BaixarLayout from '~/components/Layout/BaixarLayout.vue';
import BaixarLayoutBottom from '~/components/Layout/baixarLayoutBottom.vue';
import Faqs from '~/components/Layout/Faqs.vue';
import Footer from '~/components/Layout/Footer.vue';
import HeaderMain from '~/components/Layout/HeaderMain.vue';

</script>

<template>
    <div>
    <div class="bg-[#111] ">
        <HeaderMain class="text-gray-300 "></HeaderMain>
        <BaixarLayout/>
    </div>
    <div class="bg-[#111]">
        <BaixarLayoutBottom/>

    </div>
      <Faqs/>

    </div>
</template>

