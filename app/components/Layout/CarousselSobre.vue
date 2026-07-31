<script setup lang="ts">

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

import img1 from '~/assets/img/fim.jpg'
import img2 from '~/assets/img/seg.jpg'
import img3 from '~/assets/img/terça.jpg'
import img4 from '~/assets/img/quarta.jpg'
import img5 from '~/assets/img/sexta.jpg'

const images = [img1, img2, img3, img4, img5]
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-6 md:px-10 py-14">
    <div class="flex items-center gap-4 mb-8">
      <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Ofertas da semana</span>
      <div class="flex-1 h-px bg-[#1f1f1f]" />
    </div>

    <Carousel
      class="relative w-full"
      :opts="{ align: 'start' }"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(image, index) in images"
          :key="index"
          class="basis-full md:basis-1/2"
        >
          <div class="p-1">
            <div class="overflow-hidden rounded-2xl border border-[#1f1f1f]">
              <img
                :src="image"
                class="w-full h-44 md:h-72 object-cover"
                alt="Oferta do Supermercado Alô Pará"
              >
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>

      <CarouselPrevious class="-left-4 md:-left-12" />
      <CarouselNext class="-right-4 md:-right-12" />
    </Carousel>
  </div>
</template>
