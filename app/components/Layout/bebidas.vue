<script setup lang="ts">
import bebidas from "../../data/produtosBebidas.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";
import Dialog from "../ui/dialog/Dialog.vue";
</script>

<template>
  <div class="bg-slate-50">
    <div>
      <h2 class="text-slate-800  font-bold text-[30px] p-5">Bebidas:</h2>
    </div>

     <div class="flex justify-center">
    <Carousel
      class="relative w-full flex justify-center w-[80%]"
      :opts="{
        align: 'start',
        
      }"
    >
      <CarouselContent class="bg-slate-50 flex gap-10 p-4">

  <Dialog v-for="b in bebidas" :key="b.id">
    
    <DialogTrigger as-child>
      <CarouselItem
        class="basis-1/5 bg-slate-50 p-2 shadow"
      >
        <img class="w-full" :src="b.img" alt="">

        <div class="h-25 pt-5">
          <h3 class="text-slate-800 text-center font-bold">
            {{ b.nome }}
          </h3>
        </div>

        <h4 class="text-slate-800 text-center">
          R$
          <span class="text-green-500 text-[40px] font-bold">
            {{ b.preço }}
          </span>
        </h4>

      </CarouselItem>
    </DialogTrigger>

    <DialogContent class="bg-white ">
      <div>
        <div>
         <h3 class="text-slate-800 text-center font-bold">
            {{ b.nome }}
          </h3>

        </div>
        <img :src="b.img" alt="">

      </div>
    </DialogContent>

  </Dialog>

</CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>

  </div>
 
</template>