<script setup lang="ts"    >





import Bebidas from "../../data/produtosBebidas.json"


import Dialog from "../ui/dialog/Dialog.vue";
import DialogTrigger from "../ui/dialog/DialogTrigger.vue";
import DialogContent from "../ui/dialog/DialogContent.vue";



import { Flame, Import, PhoneCallIcon, ShoppingBasket } from "lucide-vue-next";
import Button from "../ui/button/Button.vue";

import { useCarrinho } from "~/data/composable/UseCarrinho";






const { carrinho, adicionarCarrinho } = useCarrinho()

const produtoSelecionado = ref<any>(null)
 


   const BebidasLimitados = ref(Bebidas.slice(0, 5))


  function aumentar(id: number) {
  const item = BebidasLimitados.value.find(p => p.id === id)
  if (item) item.quantidade++
}

// diminuir
function diminuir(id: number) {
  const item = BebidasLimitados.value.find(p => p.id === id)
  if (item && item.quantidade > 1) item.quantidade--


  
  
}




if (produtoSelecionado.value) {
  produtoSelecionado.value.quantidade++
}


</script>

<template>
<div class="flex justify-center flex-col items-center" >


  <div class="flex justify-between w-[60%] items-center">
    <h2 class="text-slate-800 font-bold md:text-[30px] md:p-14 text-[20px] p-3">
      Bebidas
    </h2>

    <Button variant="link" @click="navigateTo('/Bebidas')" class="text-blue-500 text-[20px]">Ver mais</Button>
  
  </div>

  <div class="flex justify-center items-center flex-col ">
    <div class="w-[100%]">




      <div
      class="relative items-center md:w-full flex justify-center md:1p-10 p-3 "
      :opts="{ align: 'start' }"
    >
  
      <div class=" flex md:gap-15 gap-1 flex-wrap  md:px-4">

  
        <Dialog v-for="B in BebidasLimitados" :key="B.id">
  
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
    @click.stop="adicionarCarrinho(B, 1)" 
    class="absolute top-3 right-3 z-10 bg-green-500 hover:bg-green-600 text-white 
    w-8 h-8 rounded-full text-xl font-bold shadow transition-colors flex items-center justify-center"
  >+</button>

  <!-- Imagem com fundo suave -->
  <div class="flex items-center justify-center bg-slate-50 h-44 p-4 
    group-hover:bg-red-100 transition-colors duration-300">
    <img class="md:w-36 w-24 object-contain drop-shadow-md 
      group-hover:scale-105 transition-transform duration-300" :src="B.img" alt="">
  </div>

  <!-- Infos -->
  <div class="p-4 flex flex-col gap-2">
    <h3 class="text-[13px] md:text-[15px] text-slate-800 font-semibold text-center leading-snug line-clamp-2 min-h-[2.5rem]">
      {{ B.nome }}
    </h3>

    <div class="flex flex-col items-center mt-1">

      <span class="text-green-600 text-2xl md:text-3xl font-extrabold leading-none">
        R$ {{ B.preço2 }}
      </span>
    </div>
  </div>
</div>
            
  
          </DialogTrigger>
  
  
   <DialogContent    class=" bg-[#111] text-slate-900 md:w-200 w-[100%] md:h-150 h-[100%] md:mt-0  ">

  <div>
    <div class="flex justify-between absolute left-3 top-10">
      <Button class="bg-[#fc0101] rounded-[20px] text-[16px] text-white font-light" > IMPERDÍVEL </Button>

      

    </div>
    <div class="bg-white flex justify-center items-center h-70" >
      <img class="w-50" :src="B.img" alt="">

    </div>

    <div class="bg-[#111] px-10 py-5">
      <div class="flex flex-col">
        

        <h2 class="text-[#f0f0f0] font-medium text-[25px]">
          {{ B.nome }}
        </h2>

        <h3 class="text-[50px] text-white font-semibold"> R$ {{ B.preço2 }}</h3>

        <div class=" ">
          <Button class="text-[#888] bg-[#1e1e1e] rounded-[20px] p-2 border-[1px] border-[#2a2a2a] ">{{ B.tipo }}</Button>

        </div>

         <div class=" mt-5 border-t border-[#222] "></div>
         <div class="flex justify-center gap-3 mt-6">

          <div class=" flex gap-2 ">
            <button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-2 w-10 border-[1px] border-[#2a2a2a] " @click="diminuir(B.id)">-</button>
          <Button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-7 border-[1px] border-[#2a2a2a] ">{{ B.quantidade }}</Button>
          <button class="text-[#888] bg-[#1e1e1e] rounded-[10px] p-2 w-10 border-[1px] border-[#2a2a2a] " @click="aumentar(B.id)">+</button>
        </div>



           
           <Button @click="produtoSelecionado = B; adicionarCarrinho(B, B.quantidade)" class="bg-[#cc1e1e] text-white p-7  font-bold text-[16px] " > Adicionar ao carrinho <span> <ShoppingBasket/> </span> </Button> 

         </div>

         
        

      </div>


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