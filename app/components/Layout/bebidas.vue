<script setup lang="ts">
import bebidas from "../../data/produtosBebidas.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";

import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";

import { PhoneCallIcon } from "lucide-vue-next";


const produtoSelecionado = ref<any>(null)


const quantidade = ref <any>(1)

function comprarWhatsapp() {



  const numero = "5594991923141"

  const produto = produtoSelecionado.value

   const mensagem = `
Olá! Quero comprar:

  Produto: ${produto.nome}
  Preço: R$ ${produto.preço2 ?? produto.preço}
  quantidade: ${quantidade.value}


  `

  const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`

  window.open(url, "_blank")
  quantidade.value=1
}

function adicionar(){
  return quantidade.value ++
}
function diminuir(){

  if(quantidade.value > 1){
      quantidade.value --
  }

    
}


</script>

<template>
<div class="bg-slate-50">
  <div>
    <h2 class="text-slate-800 font-bold md:text-[30px] md:p-14 text-[20px] p-3">
      Bebidas:
    </h2>
  </div>



  <div class="flex justify-center">

    <Carousel
      class="relative w-full flex justify-center w-[80%]"
      :opts="{ align: 'start' }"
    >

      <CarouselContent class="bg-slate-50 flex md:gap-10 gap-5 px-4">

        <Dialog v-for="b in bebidas" :key="b.id">

          <DialogTrigger as-child>

            <CarouselItem
              class="basis-1/2 md:basis-1/4 border-[1px] border-slate-300 bg-slate-50 p-1 shadow 
                flex flex-col items-center cursor-pointer md:w-[40%] w-[25px] md:h-75 h-55"
            >

              <img class="md:w-40 w-25" :src="b.img" alt="">

              <div class="h-25 pt-5">
                <h3 class="md:text-[17px] text-[13px] text-center text-slate-800 font-semibold">
                  {{ b.nome }}
                </h3>
              </div>

              <h4 class="text-slate-800 text-center font-bold">
                R$
                <span class="text-green-500 md:text-[40px] text-[30px] font-bold">
                  {{ b.preço }}
                </span>
              </h4>

            </CarouselItem>

          </DialogTrigger>


           <DialogContent class="bg-white text-slate-900 md:w-200 w-[100%] md:h-150 h-[75%] md:mt-0 mt-[25%]">

              <div class="md:flex justify-between items-center gap-4 md:mx-7">

                <div class="flex item justify-center">
                  <img class="md:w-70 w-[50%]" :src="b.img" alt="">
                </div>

                <div class="flex flex-col gap-4 text-center">

                  <h3 class="text-[32px] font-bold text-center">
                    {{ b.nome }}
                  </h3>

                  <p class="md:w-100 w-[90%] text-slate-500">
                    Clique em comprar no whatsapp e seja direcionado para o contato do nosso
                    atacado de compras online
                  </p>

                  <div class="flex items-center justify-center gap-6 md:m-3">

                    <p class="text-green-600 text-3xl font-bold">
                      R$ {{ b.preço }}
                    </p>

                  </div>

                  <div class="flex gap-4">
                    <p class="font-bold">quantidade:</p>

                    <Button @click="diminuir">-</Button>

                    <input
                      v-model="quantidade"
                      class="bg-gray-200 rounded-[10px] text-center w-20 p-1"
                    >

                    <Button @click="adicionar">+</Button>

                  </div>

                  <Button
                    @click="produtoSelecionado = b; comprarWhatsapp()"
                    class="bg-green-500 p-7 md:mt-10 font-bold text-[16px]"
                  >
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

       <CarouselPrevious class="ml-3 md:ml-[0px]" />
        <CarouselNext class="mr-3 md:mr-[0px]" />

    </Carousel>

  </div>

</div>
</template>