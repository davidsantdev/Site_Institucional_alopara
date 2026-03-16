```vue
<script setup lang="ts">

import bebidas from "../../data/produtosBebidas.json"

import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";

import { FireExtinguisher, Flame, PhoneCallIcon } from "lucide-vue-next";
import Button from "../ui/button/Button.vue";

const produtoSelecionado = ref<any>(null)

const quantidade = ref<any>(1)

const bebidasLimitadas = bebidas.slice(0,5)

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
  quantidade.value = 1
}

function adicionar(){
  return quantidade.value++
}

function diminuir(){

  if(quantidade.value > 1){
      quantidade.value--
  }

}

</script>

<template>
<div class="flex justify-center flex-col items-center" >

  <div>
    <h2 class="text-slate-800 font-bold md:text-[30px] md:p-14 text-[20px] p-1">
      Bebidas:
    </h2>
  </div>

  <div class="flex justify-center items-center flex-col">
    <div class="w-[100%]">

      <div
      class="relative md:w-full flex justify-center md:1p-10 p-3"
      :opts="{ align: 'start' }"
      >

      <div class="flex md:gap-15 gap-1 flex-wrap md:px-4">

        <Dialog v-for="b in bebidasLimitadas" :key="b.id">

          <DialogTrigger as-child>
  <div
              class="   border-[1px] border-slate-300 bg-slate-50 p-1 shadow 
            flex flex-col  cursor-pointer md:w-[300px] w-[48%] md:h-[450px] h-75  "
            >
            <div class="flex items-center justify-center">
              <img class="md:w-40 w-25" :src="b.img" alt="">

            </div>
            <div class="px-6"> 

           
  

              <div class="justify-between flex">
                 <button class="bg-[#FF7733] leading-none flex gap-1 h-6 w-30 justify-center items-center text-[12px] rounded-[3px] font-semibold">Mais vendido  <Flame/> </button>

                <button class="bg-green-400 w-[40px] h-[40px] rounded-full">+</button>

              </div>
  
              <div class="md:h-25 h-[30%] md:pt-5 ">
                <h3 class="md:text-[17px] text-[13px]  text-center text-slate-800 font-semibold">
                  {{ b.nome }}
                </h3>
              </div>
              <div class="h-20 flex items-center ">
  
       

  
              <h4 class="text-slate-800  ">
                
                <span class="text-slate-900 md:text-[33px] text-[20px] font-semibold">
                   R$ {{ b.preço }}
                </span>
              </h4>

               </div>
               </div>
            </div>
  

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

      </div>

    </div>

    </div>

  </div>

</div>
</template>

