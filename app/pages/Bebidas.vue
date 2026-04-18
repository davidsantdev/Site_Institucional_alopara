<script setup lang="ts"    >





import Button from "~/components/ui/button/Button.vue";
import Bebidas from "../data/produtosBebidas.json"

import { Flame, PhoneCallIcon, ShoppingBasket } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";

import { useCarrinho } from "~/data/composable/UseCarrinho";
import Limpeza from "~/components/Layout/limpeza.vue";
import Footer from "~/components/Layout/Footer.vue";

const { carrinho, adicionarCarrinho } = useCarrinho()

const produtos = ref(Bebidas)

const produtoSelecionado = ref<any>(null)

const PaginacaoAtual = ref(1)
const itensPorPagina = 10

const totalPaginas = computed(() =>
  Math.ceil(produtos.value.length / itensPorPagina))

const produtosPaginados = computed(() => {
  const inicio = (PaginacaoAtual.value - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return produtos.value.slice(inicio, fim) // <-- produtos.value
})

function irParaPagina(Pagina){
  PaginacaoAtual.value = Pagina
}





function aumentar(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item) item.quantidade++
}

// diminuir
function diminuir(id: number) {
  const item = produtos.value.find(p => p.id === id)
  if (item && item.quantidade > 1) item.quantidade--


  
  
}


</script>

<template>
    <div class="bg-[#F4F4F4] flex flex-col justify-center ">
        <HeaderMain/>
        
        
        
        <div class="bg-red-500 h-[100px]  items-center flex justify-center">
            <h3 class="text-[27px] font-bold p-5">Alimentos mais comprados do Alô Pará</h3>
            
        </div>



        







        
        <div >
              <div class=" p-4 flex flex gap-1 flex-wrap">
                <Button  @click="navigateTo('/Alimentos')" variant="link" class="text-blue-500 text-[17px] ">Alimentos</Button>
               
        <Button  @click="navigateTo('/Limpeza')" variant="link" class="text-blue-500 text-[17px] ">Limpeza</Button>
        <Button  @click="navigateTo('/Perfumaria')" variant="link" class="text-blue-500 text-[17px] ">Perfumaria</Button>
        <Button  @click="navigateTo('/Vinhos')" variant="link" class="text-blue-500 text-[17px] ">Vinhos</Button>
        <Button  @click="navigateTo('/Bebidas')" variant="link" class="text-blue-500 text-[17px] ">Bebidas</Button>

    </div>


     <div class="flex justify-center gap-2 m-10 flex-wrap">

  <!-- ANTERIOR -->
  <button 
    @click="PaginacaoAtual > 1 && PaginacaoAtual--"
    class="px-3 py-1 bg-red-500 rounded"
  >
    Anterior
  </button>

  <!-- NÚMEROS -->
  <button
    v-for="page in totalPaginas"
    :key="page"
    @click="irParaPagina(page)"
    :class="[
      'px-3 py-1 rounded',
      page === PaginacaoAtual ? 'bg-red-500 text-white' : 'bg-red-400'
    ]"
  >
    {{ page }}
  </button>

  <!-- PRÓXIMO -->
  <button 
    @click="PaginacaoAtual < totalPaginas && PaginacaoAtual++"
    class="px-3 py-1 bg-red-500 rounded"
  >
    Próximo
  </button>

</div>

        <div class="flex justify-center flex-col items-center" >



  <div class="flex justify-center items-center flex-col ">
    
   


    <div class="w-[100%]">




      <div
      class="relative items-center md:w-full flex justify-center md:1p-10 p-3 "
      :opts="{ align: 'start' }"
    >
  
      <div class=" flex md:gap-15 gap-1 flex-wrap  md:px-4">
  
  
        <Dialog v-for="B in produtosPaginados" :key="B.id">
  
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
      <span class="text-slate-400 text-xs line-through">R$ {{ B.preço1 }}</span>
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


 
     <div class="flex justify-center gap-2 m-10 flex-wrap">

  <!-- ANTERIOR -->
  <button 
    @click="PaginacaoAtual > 1 && PaginacaoAtual--"
    class="px-3 py-1 bg-red-500 rounded"
  >
    Anterior
  </button>

  <!-- NÚMEROS -->
  <button
    v-for="page in totalPaginas"
    :key="page"
    @click="irParaPagina(page)"
    :class="[
      'px-3 py-1 rounded',
      page === PaginacaoAtual ? 'bg-red-500 text-white' : 'bg-red-400'
    ]"
  >
    {{ page }}
  </button>

  <!-- PRÓXIMO -->
  <button 
    @click="PaginacaoAtual < totalPaginas && PaginacaoAtual++"
    class="px-3 py-1 bg-red-500 rounded"
  >
    Próximo
  </button>

</div>

<Footer/>



</div>

 
<Foote/>

    </div>
</template>