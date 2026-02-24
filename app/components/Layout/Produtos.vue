<script setup lang="ts">
import produtos from "../../data/produtosVinho.json"
</script>

<template>
    <div class="flex justify-center bg-slate-100">
        <div class="flex flex-wrap w-[60%] justify-center gap-6 ">
        <div v-for="V in produtos" :key="V.id  " class="bg-slate-50 h-100  p-2 shadow">
            <img class="w-[250px]" :src="V.img" alt="">
            <h3 class="text-[20px ] text-black  w-[70%] font-semibold" >{{ V.nome }}</h3>
            <h4 class="text-slate-800">R$ <span class="text-green-500 text-[40px] font-bold"> {{ V.preço }}</span> </h4> 
        </div>
    </div>

    </div>
    
</template>