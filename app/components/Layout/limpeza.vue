<script setup lang="ts">
import limpeza from "../../data/produtosLimpeza.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";

</script>

<template>
    <div class="flex justify-center">
         <Carousel
      class="relative w-full flex justify-center w-[80%] p-10"
      :opts="{
        align: 'start',
        
      }"
    >
      <CarouselContent class="bg-slate-50 flex  gap-10 p-3 ">
        <CarouselItem
          v-for="L in limpeza"
          :key="L.id"
          class="basis-1/5 bg-slate-50 p-2 shadow flex border-[2px]  justify-center flex-col items-center"
        >
          <img class="w-40" :src="L.img" alt="">
          <div class=" h-25 pt-5">
             <h3 class="text-[17px] text-center text-slate-800 font-semibold">
            {{ L.nome }}
          </h3>

          </div>
          <div>
            <h4 class="text-slate-800 text-center font-bold">
                DE: R$

                <span class="text-red-500 text-[14px] font-bold">
                       {{ L.preço1 }}
                     </span>
            </h4>

          </div>
         
        
           
            <div class="">
                  <h4 class="text-slate-800 text-center font-bold">R$
               
                <span class="text-green-500 text-[40px] font-bold">
                  {{ L.preço2 }}
                </span>
                </h4>

            </div>
          
        </CarouselItem>
      </CarouselContent>
      

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
    </div>
</template>