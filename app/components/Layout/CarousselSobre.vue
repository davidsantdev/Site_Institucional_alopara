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
  <div class="flex justify-center md:p-15 p-7">
           

       



  <Carousel
    class="relative md:w-[90%] w-[100%] "
    :opts="{ align: 'start' }"
  >
    <CarouselContent>
      <CarouselItem
        v-for="(image, index) in images"
        :key="index"
        class="md:basis-1/2 basis-1/1 "
      >
        <div class="p-1">
          <Card class="overflow-hidden rounded-2xl">
            <CardContent class="p-0">
              <img
                :src="image"
                class="md:w-full  md:h-70 h-40 w-120 object-cover rounded-[20px]"
                alt="Imagem do carousel"
              />
            </CardContent>
          </Card>
        </div>
      </CarouselItem>
    </CarouselContent>

    <CarouselPrevious class="ml-5" />
    <CarouselNext class="mr-5"/>
  </Carousel>


   </div>
</template>
