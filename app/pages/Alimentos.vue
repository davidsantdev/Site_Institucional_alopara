<script setup lang="ts"    >





import Button from "~/components/ui/button/Button.vue";
import Alimentos from "../data/produtosAlimentos.json"

import { Flame, PhoneCallIcon, ShoppingBasket } from "lucide-vue-next";
import HeaderMain from "~/components/Layout/HeaderMain.vue";
import Footer from "~/components/Layout/Footer.vue";
import { useCarrinho } from "~/data/composable/UseCarrinho";
import Limpeza from "~/components/Layout/limpeza.vue";

const { carrinho, adicionarCarrinho } = useCarrinho()

const quantidade = Limpeza.quantidade

const produtoSelecionado = ref<any>(null)

const PaginacaoAtual = ref(1)
const itensPorPagina = 10

const totalPaginas = computed (()=>
Math.ceil(Alimentos.length / itensPorPagina))

const produtosPaginados = computed (()=>{
  const inicio= (PaginacaoAtual.value -1) * itensPorPagina
  const fim = inicio + itensPorPagina
  return Alimentos.slice(inicio,fim)
})

function irParaPagina(Pagina){
  PaginacaoAtual.value = Pagina
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
    class="px-3 py-1 bg-blue-400 rounded"
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
      page === PaginacaoAtual ? 'bg-blue-500 text-white' : 'bg-blue-400'
    ]"
  >
    {{ page }}
  </button>

  <!-- PRÓXIMO -->
  <button 
    @click="PaginacaoAtual < totalPaginas && PaginacaoAtual++"
    class="px-3 py-1 bg-blue-400 rounded"
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
  
  
        <Dialog v-for="A in produtosPaginados" :key="A.id">
  
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

                <button @click="adicionarCarrinho(A, 1)" class="bg-green-400 w-[40px] h-[40px] rounded-full ">+</button>

              </div>
  
              <div class="md:h-25 h-[30%] md:pt-5 ">
                <h3 class="md:text-[17px] text-[13px]  text-center text-slate-800 font-semibold">
                  {{ A.nome }}
                </h3>
              </div>
              <div class="h-25 flex items-center justify-center flex-col ">
  
             
  
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
                    @click="produtoSelecionado = A; adicionarCarrinho(A)"
                    class="bg-green-500 p-7 md:mt-10 font-bold text-[16px] "
                  >
                    Adicionar ao carrinho
                    <span>
                      <ShoppingBasket :size="90"/>
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


  <div class="flex justify-center gap-2 m-10 flex-wrap">

  <!-- ANTERIOR -->
  <button 
    @click="PaginacaoAtual > 1 && PaginacaoAtual--"
    class="px-3 py-1 bg-blue-400 rounded"
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
      page === PaginacaoAtual ? 'bg-blue-500 text-white' : 'bg-blue-400'
    ]"
  >
    {{ page }}
  </button>

  <!-- PRÓXIMO -->
  <button 
    @click="PaginacaoAtual < totalPaginas && PaginacaoAtual++"
    class="px-3 py-1 bg-blue-400 rounded"
  >
    Próximo
  </button>

</div>



</div>

 
<Foote/>

    </div>
</template>