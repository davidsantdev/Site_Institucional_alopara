<script setup lang="ts">

import { LucideShoppingCart, Menu, MenuIcon, ShoppingBasket, ShoppingCart, Store, UserPlus } from 'lucide-vue-next';
import DropdownMenu from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuGroup from '../ui/dropdown-menu/DropdownMenuGroup.vue';
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue';

import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';
import Mobilemenu from './Mobilemenu.vue';
import { useCarrinho } from '~/data/composable/UseCarrinho';

const {totalItens} = useCarrinho()


function inicio (){

}

</script>

<template>
    <div class="flex flex-col  w-full z-100 ">
      
        <header class="flex justify-between pd:mx-20 h-20  text-[20px]  bg-gray-50 text-gray-900  items-center px-20">
            
            <div @click="navigateTo('/')">
                <img  src="../../assets/img/alop.png"" alt="" class="w-[200px] md:block hidden">

            </div>
            <div class="flex items-center">
                <div class="flex md:mx-20  w-22 ">
                    <img src="../../assets/img/car.png"  class="text-red-600 w-[53px]" @click="navigateTo('/Carrinho')">  </img>
                    <div v-if="totalItens.compra" class="w-6 h-6 bg-red-500 text-center flex items-center justify-center rounded-full text-white font-bold"> {{ totalItens.total }} </div>

                </div>
                

                <div class="flex gap-2 items-center text-red-600 font-semibold">
                    <Store :size="40"></Store>
                   <h2 class="md:text-[18px] text-[13px]">Compre online</h2> 
                </div>
                 <div class="flex gap-2 items-center text-red-600 m-4 font-semibold">
                    <UserPlus :size="40"></UserPlus>
                   <h2 class="md:text-[18px] text-[13px]">Seja um fornecedor</h2> 
                </div>

            </div>            

         
        </header>

        <div class="bg-gray-50 shadow h-30 md:h-13 p-2 border-1 border-gray-300 text-gray-800 flex justify-between px-7 ">

            
                <div @click="navigateTo('/')">
                    
                    <img  src="../../assets/img/alop.png"" alt="" class="w-[170px] md:hidden">
    
                
                </div>

       



               <div class="md:flex gap-10 hidden">
                 <Button @click="navigateTo('/')" variant="ghost" class=" text-[14px] font-bold flex gap-3">   Inicio     </Button>
                <Button  variant="ghost">
                     <Button @click="navigateTo('/Baixar')" variant="ghost" class="  text-[14px] font-bold flex gap-3">   Baixar app   </Button>


                </Button>
                 <Button @click="navigateTo('/trabalhe-conosco')" variant="ghost" class=" text-[14px] font-bold flex gap-3">   Trabalhe conosco    </Button>

                <a href="https://cadastramento-alopara.mercafacil.com/home"> <Button class=" text-[14px] font-bold flex gap-3" variant="ghost">Clube de descontos</Button> </a>

                
                

     
            </div>





             <div class="md:hidden gap-10 flex">
               
                <Mobilemenu/>
 
          

            </div>
        </div>
        </div>

</template>

