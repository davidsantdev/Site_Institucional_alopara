<script setup lang="ts">
import produtos from "../../data/produtosVinho.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";
</script>

<template>
  <div>
    <div>
      <h2 class="text-slate-800  font-bold text-[30px] p-5">Vinhos:</h2>
    </div>

     <div class="flex justify-center">
    <Carousel
      class="relative w-full flex justify-center w-[80%]"
      :opts="{
        align: 'start',
        
      }"
    >
      <CarouselContent class="bg-slate-50  flex gap-10 p-4">
        <CarouselItem
          v-for="V in produtos"
          :key="V.id"
          class="basis-1/5 bg-slate-50 p-2 shadow "
        >
          <img class="w-full" :src="V.img" alt="">
          <div class=" h-25 pt-5">
             <h3 class="text-slate-800 text-center font-bold">
            {{ V.nome }}
          </h3>

          </div>
         
          <h4 class="text-slate-800 text-center">
            R$
            <span class="text-green-500 text-[40px] font-bold">
              {{ V.preço }}
            </span>
          </h4>
        </CarouselItem>
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>

  </div>
 
</template>