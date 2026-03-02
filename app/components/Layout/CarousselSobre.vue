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
  <div class="flex justify-center p-15 ">
           

       



  <Carousel
    class="relative w-[90%] "
    :opts="{ align: 'start' }"
  >
    <CarouselContent>
      <CarouselItem
        v-for="(image, index) in images"
        :key="index"
        class="md:basis-1/2 lg:basis-1/3"
      >
        <div class="p-1">
          <Card class="overflow-hidden rounded-2xl">
            <CardContent class="p-0">
              <img
                :src="image"
                class="w-full h-70 object-cover"
                alt="Imagem do carousel"
              />
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>

    <CarouselPrevious />
    <CarouselNext />
  </Carousel>


   </div>
</template>
