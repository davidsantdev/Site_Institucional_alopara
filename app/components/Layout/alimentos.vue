<script setup lang="ts">
import alimentos from "../../data/produtosAlimentos.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";
</script>

<template>
    <div>
        <div>
      <h2 class="text-slate-800  font-bold text-[30px] p-5">Ofertas da semana:</h2>
    </div>
        
        <div class="flex justify-center">
    <Carousel
      class="relative w-full flex justify-center w-[80%] p-10"
      :opts="{
        align: 'start',
        
      }"
    >
      <CarouselContent class="bg-slate-50 flex  gap-10 p-3 ">
        <CarouselItem
          v-for="A in alimentos"
          :key="A.id"
          class="basis-1/5 bg-slate-50 p-2 shadow flex border-[2px]  justify-center flex-col items-center"
        >
          <img class="w-40" :src="A.img" alt="">
          <div class=" h-25 pt-5">
             <h3 class="text-[17px] text-center text-slate-800 font-semibold">
            {{ A.nome }}
          </h3>

          </div>
          <div>
            <h4 class="text-slate-800 text-center font-bold">
                DE: R$

                <span class="text-red-500 text-[14px] font-bold">
                       {{ A.preço1 }}
                     </span>
            </h4>

          </div>
         
        
           
            <div class="">
                  <h4 class="text-slate-800 text-center font-bold">R$
               
                <span class="text-green-500 text-[40px] font-bold">
                  {{ A.preço2 }}
                </span>
                </h4>

            </div>
          
        </CarouselItem>
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
    </div>
</template>