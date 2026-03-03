<script setup lang="ts"    >





import alimentos from "../../data/produtosAlimentos.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";

import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import Limpeza from "./limpeza.vue"

import { PhoneCallIcon } from "lucide-vue-next";
import Button from "../ui/button/Button.vue";


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
<div>

  <div>
    <h2 class="text-slate-800 font-bold text-[30px] p-5">
      Ofertas da semana:
    </h2>
  </div>

  <div class="flex justify-center items-center flex-col ">

      <Carousel
      class="relative  w-full flex justify-center w-[80%] p-10 "
      :opts="{ align: 'start' }"
    >

      <CarouselContent class="bg-slate-50 flex gap-10 p-3">


        <Dialog v-for="A in alimentos" :key="A.id">

          <DialogTrigger as-child>

            <CarouselItem
              class="basis-1/5 bg-slate-50 p-2 shadow border-[2px]
              flex flex-col items-center cursor-pointer md:w-[100%] w-20"
            >

              <img class="w-40" :src="A.img" alt="">

              <div class="h-25 pt-5">
                <h3 class="text-[17px] text-center text-slate-800 font-semibold">
                  {{ A.nome }}
                </h3>
              </div>

              <h4 class="text-slate-800 text-center font-bold">
                DE:
                <span class="text-red-500 text-[14px] line-through">
                  R$ {{ A.preço1 }}
                </span>
              </h4>

              <h4 class="text-slate-800 text-center font-bold">
                R$
                <span class="text-green-500 text-[40px] font-bold">
                  {{ A.preço2 }}
                </span>
              </h4>

            </CarouselItem>

          </DialogTrigger>


          <DialogContent class="bg-white text-slate-900 w-200 h-150">

            <div class="flex justify-between items-center gap-4 mx-7">
              

              <div>
                <img class="w-70" :src="A.img" alt="">

              </div>
              <div class="flex flex-col gap-4 text-center">
                
                <h3 class="text-[32px] font-bold text-center">
                  {{ A.nome }}
                </h3>

                <p class="w-100 text-slate-500">Clique em comprar no whatsapp e seja direcionado para o contato do nosso
                  atacado de compras online
                </p>
                <div  class="flex gap-6 m-3">
                 
                  <p class="text-green-6
                   text-3xl font-bold">
                    R$ {{ A.preço2 }}
                  </p>
                   <p class="text-red-500 line-through">
                   R$ {{ A.preço1 }}
                  </p>
                  

                 

                </div>
                <div class="flex gap-4">
                  <p class="font-bold">quantidade:</p> <Button @click="diminuir"> <span  class="">-</span></Button>   <input  v-model="quantidade" class="bg-gray-200 rounded-[10px]  text-center w-20 p-1"></input> <Button @click="adicionar" >  <span >+</span></Button> 

                </div>


                 <Button   @click="produtoSelecionado = A; comprarWhatsapp()" class="bg-green-500 p-7 mt-10 font-bold text-[16px]">Comprar no Whatsapp <span><PhoneCallIcon></PhoneCallIcon></span> </Button>

              </div>






            </div>

          </DialogContent>

        </Dialog>

      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />

    </Carousel>

    <div class="flex justify-center items-center">
      <Limpeza />
    </div>

  </div>

</div>
</template>