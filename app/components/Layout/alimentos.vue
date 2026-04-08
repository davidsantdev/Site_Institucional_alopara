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
              class="   border-[1px] border-slate-300 bg-slate-50 p-1 shadow 
            flex flex-col  cursor-pointer md:w-[300px] w-[48%] md:h-[450px] h-75  "
            >
            <div class="flex items-center justify-center">
              <img class="md:w-40 w-25" :src="A.img" alt="">

            </div>
            <div class="px-6"> 

           
  

              <div class="justify-between flex">
                   <button class="bg-[#FF7733] leading-none flex gap-1 h-6 w-30 justify-center items-center text-[12px] rounded-[3px] font-semibold">Mais vendido  <Flame/> </button>

                <button class="bg-green-400 w-[40px] h-[40px] rounded-full">+</button>

              </div>
  
              <div class="md:h-25 h-[30%] md:pt-5 ">
                <h3 class="md:text-[17px] text-[13px]  text-center text-slate-800 font-semibold">
                  {{ A.nome }}
                </h3>
              </div>
              <div class="h-25 flex items-center justify-center flex-col ">
  
              <h4 class="text-slate-800  md:text-[16px] text-[11px]">
                 R$
                <span class="text-slate-500  md:text-[17px] text-[12px] line-through">
                  {{ A.preço1 }}
                </span>
              </h4>
  
              <h4 class="text-slate-800  ">
                
                <span class="text-slate-900 md:text-[33px] text-[20px] font-semibold">
                   R$ {{ A.preço2 }}
                </span>
              </h4>

               </div>
               </div>
            </div>
  
            
  
          </DialogTrigger>
  
  
          <DialogContent class="bg-white text-slate-900 md:w-200 w-[100%] md:h-150 h-[75%] md:mt-0 mt-[25%]">

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