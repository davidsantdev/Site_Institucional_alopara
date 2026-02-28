<script setup lang="ts">

import { Menu, MenuIcon, Store, UserPlus } from 'lucide-vue-next';
import DropdownMenu from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuGroup from '../ui/dropdown-menu/DropdownMenuGroup.vue';
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue';

import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';
import Mobilemenu from './Mobilemenu.vue';



</script>

<template>
    <div >
      
        <header class="flex justify-between pd:mx-20  text-[20px]  bg-gray-50 text-gray-900 w-[full] items-center px-30">
            
            <div>
                <img src="../../assets/img/alop.png"" alt="" class="w-[120px] ">

            </div>
            <div class="flex gap-10">
                <div class="flex gap-2 items-center text-red-600 font-semibold">
                    <Store :size="40"></Store>
                   <h2 class="text-[18px]">Compre online</h2> 
                </div>
                 <div class="flex gap-2 items-center text-red-600 font-semibold">
                    <UserPlus :size="40"></UserPlus>
                   <h2 class="text-[18px]">Seja um fornecedor</h2> 
                </div>

            </div>

         
        </header>

        <div class="bg-gray-50 shadow border-1 border-gray-300 text-gray-800 flex justify-between px-7 ">
            <div>

                   <DropdownMenu>
    <DropdownMenuTrigger as-child>
        <button>
            <Menu :size="50" class="  "/> 
        </button>


    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-40 h-100 " >
      <DropdownMenuLabel>Junte-se a equipe</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem >

          <NuxtLink to="/trabalhe-conosco">Trabalhe Conosco</NuxtLink>

        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuLabel>Duvidas</DropdownMenuLabel>
        <DropdownMenuItem>
          Clube de descontos

        </DropdownMenuItem>
        <DropdownMenuItem>
          Compras online

        </DropdownMenuItem>

         
      </DropdownMenuGroup>
    </DropdownMenuContent>
        </DropdownMenu>




            </div>



               <div class="md:flex gap-10 hidden">
                <button>
                   <NuxtLink to="/">Inicio</NuxtLink>
                </button>
                <button>
                    <NuxtLink to="/Baixar">Baixar app</NuxtLink>

                </button>
                <button><NuxtLink to="/trabalhe-conosco">Trabalhe Conosco</NuxtLink></button>
                

     
            </div>





             <div class="md:hidden gap-10 flex">
               
                <Mobilemenu/>
 
          

            </div>
        </div>
        </div>

</template>

