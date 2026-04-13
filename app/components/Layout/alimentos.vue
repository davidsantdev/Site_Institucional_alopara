<script setup lang="ts"    >





import alimentos from "../../data/produtosAlimentos.json"
import { Carousel, CarouselContent, CarouselNext, CarouselPrevious } from "../ui/carousel";
import CarouselItem from "../ui/carousel/CarouselItem.vue";

import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";
import Limpeza from "./limpeza.vue"



import { Flame, Import, PhoneCallIcon, ShoppingBasket } from "lucide-vue-next";
import Button from "../ui/button/Button.vue";
import Perfumaria from "./Perfumaria.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";
import Produtos from "./Produtos.vue";




const { carrinho, adicionarCarrinho } = useCarrinho()

const produtoSelecionado = ref<any>(null)
 


  const alimentosLimitados = alimentos.slice(0, 5)





if (produtoSelecionado.value) {
  produtoSelecionado.value.quantidade++
}

function diminuir() {
  if (
    produtoSelecionado.value &&
    produtoSelecionado.value.quantidade > 1
  ) {
    produtoSelecionado.value.quantidade--
  }
}

</script>

<template>
<div class="flex justify-center flex-col items-center" >


  <div class="flex justify-between w-[60%] items-center">
    <h2 class="text-slate-800 font-bold md:text-[30px] md:p-14 text-[20px] p-3">
      Alimentos
    </h2>

    <Button variant="link" @click="navigateTo('/Alimentos')" class="text-blue-500 text-[20px]">Ver mais</Button>
  
  </div>

  <div class="flex justify-center items-center flex-col ">
    <div class="w-[100%]">




      <div
      class="relative items-center md:w-full flex justify-center md:1p-10 p-3 "
      :opts="{ align: 'start' }"
    >
  
      <div class=" flex md:gap-15 gap-1 flex-wrap  md:px-4">
  
  
        <Dialog v-for="A in alimentosLimitados" :key="A.id">
  
          <DialogTrigger as-child>
  
<div
  class="relative border border-slate-200 bg-white rounded-2xl shadow-md hover:shadow-xl 
  transition-all duration-300 cursor-pointer md:w-[280px] w-[48%] overflow-hidden group"
>
  <!-- Badge mais vendido -->
  <div class="absolute top-3 left-3 z-10 bg-orange-500 text-white text-[10px] font-bold 
    px-2 py-1 rounded-full flex items-center gap-1 shadow">
    Mais vendido <Flame :size="11"/>
  </div>

  <!-- Botão + rápido -->
  <button 
    @click.stop="adicionarCarrinho(A, 1)" 
    class="absolute top-3 right-3 z-10 bg-green-500 hover:bg-green-600 text-white 
    w-8 h-8 rounded-full text-xl font-bold shadow transition-colors flex items-center justify-center"
  >+</button>

  <!-- Imagem com fundo suave -->
  <div class="flex items-center justify-center bg-slate-50 h-44 p-4 
    group-hover:bg-red-100 transition-colors duration-300">
    <img class="md:w-36 w-24 object-contain drop-shadow-md 
      group-hover:scale-105 transition-transform duration-300" :src="A.img" alt="">
  </div>

  <!-- Infos -->
  <div class="p-4 flex flex-col gap-2">
    <h3 class="text-[13px] md:text-[15px] text-slate-800 font-semibold text-center leading-snug line-clamp-2 min-h-[2.5rem]">
      {{ A.nome }}
    </h3>

    <div class="flex flex-col items-center mt-1">
      <span class="text-slate-400 text-xs line-through">R$ {{ A.preço1 }}</span>
      <span class="text-green-600 text-2xl md:text-3xl font-extrabold leading-none">
        R$ {{ A.preço2 }}
      </span>
    </div>
  </div>
</div>
            
  
          </DialogTrigger>
  
  
          <DialogContent class="bg-white text-slate-900 md:w-200 w-[100%] md:h-150 h-[75%] md:mt-0 mt-[25%]  overflow-y-auto">

              <div class="md:flex justify-between items-center gap-4 md:mx-7">

                <div class="flex item justify-center">
                  <img class="md:w-70 w-[50%]" :src="A.img" alt="">
                </div>

                <div class="flex flex-col gap-4 text-center">

                  <h3 class="text-[32px] font-bold text-center">
                    {{ A.nome }}
                  </h3>

                  <p class="md:w-100 w-[90%] text-slate-500">
                    Clique em comprar no whatsapp e seja direcionado para o contato do nosso
                    atacado de compras online
                  </p>
                   <div class="flex items-center justify-center md:gap-6 md:m-3">

                <p class="text-green-600 text-3xl font-bold">
                  R$ {{ A.preço2 }}
                </p>

                <p class="text-red-500 line-through">
                  R$ {{ A.preço1 }}
                </p>

              </div>

                 

                  

                  <Button
                    @click="produtoSelecionado = A; adicionarCarrinho(A)"
                    class="bg-green-500 p-7 md:mt-10 font-bold text-[16px] "
                  >
                    Adicionar ao carrinho
                    <span>
                      <ShoppingBasket/>
                    </span>
                  </Button>

                </div>

              </div>

            </DialogContent>
  
        </Dialog>
  
      </div>

  
        
    </div>
    </div>
    <Limpeza/>
    <Perfumaria/>


    
    

  </div>

</div>

</template>