<script setup lang="ts">
import produtos from "../../data/produtosVinho.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";

import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";

import Bebidas from "./bebidas.vue";
import { PhoneCallIcon } from "lucide-vue-next";

const produtoSelecionado = ref<any>(null)

function comprarWhatsapp() {



  const numero = "5594991923141"

  const produto = produtoSelecionado.value

  const mensagem = `
Olá! Quero comprar:

  Produto: ${produto.nome}
  Preço: R$ ${produto.preço2 ?? produto.preço}

Vi no site do Supermercado Alô Pará.
  `

  const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`

  window.open(url, "_blank")
}






</script>

<template>
<div class="flex flex-col">



  <div class="flex justify-center">

    <Carousel
      class="relative w-full flex justify-center w-[80%]"
      :opts="{ align: 'start' }"
    >

      <CarouselContent class="bg-slate-50 flex gap-10 p-4">

        <Dialog v-for="V in produtos" :key="V.id">

          <DialogTrigger as-child>

            <CarouselItem
              class="basis-1/5 bg-slate-50 p-2 shadow border-[2px]
              flex flex-col items-center cursor-pointer"
            >

              <img class="w-full" :src="V.img" alt="">

              <div class="h-25 pt-5">
                <h3 class="text-slate-800 text-center font-bold">
                  {{ V.nome }}
                </h3>
              </div>

              <h4 class="text-slate-800 text-center font-bold">
                R$
                <span class="text-green-500 text-[40px] font-bold">
                  {{ V.preço }}
                </span>
              </h4>

            </CarouselItem>

          </DialogTrigger>


          <DialogContent class="bg-white text-slate-900 w-200 h-150">

            <div class="flex justify-between items-center gap-4 mx-7">

              <div>
                <img class="w-70" :src="V.img" alt="">
              </div>

              <div class="flex flex-col gap-4 text-center">

                <h3 class="text-[32px] font-bold">
                  {{ V.nome }}
                </h3>

                <p class="w-100 text-slate-500">
                  Clique em comprar no whatsapp e seja direcionado para o contato do nosso
                  atacado de compras online
                </p>

                <div class="flex gap-6 m-3">

                  <p class="text-green-600 text-3xl font-bold">
                    R$ {{ V.preço }}
                  </p>

                </div>

                <Button @click="produtoSelecionado = V; comprarWhatsapp()" class="bg-green-500 p-7 mt-10 font-bold text-[16px]">
                  Comprar no Whatsapp
                  <span>
                    <PhoneCallIcon />
                  </span>
                </Button>

              </div>

            </div>

          </DialogContent>

        </Dialog>

      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />

    </Carousel>

  </div>

  <Bebidas />

</div>
</template>