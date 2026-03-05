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
    <div class="flex flex-col  w-[100%] z-100 ">
      
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

        <div class="bg-gray-50 shadow p-2 border-1 border-gray-300 text-gray-800 flex justify-end px-7 ">
       



               <div class="md:flex gap-10 hidden">
                <Button variant="ghost">
                   <NuxtLink to="/">Inicio</NuxtLink>
                </Button>
                <Button variant="ghost">
                    <NuxtLink to="/Baixar">Baixar app</NuxtLink>

                </Button>
                <Button variant="ghost"><NuxtLink to="/trabalhe-conosco">Trabalhe Conosco</NuxtLink></Button>

                <a href="https://cadastramento-alopara.mercafacil.com/home"> <Button variant="ghost">Clube de descontos</Button> </a>

                
                

     
            </div>





             <div class="md:hidden gap-10 flex">
               
                <Mobilemenu/>
 
          

            </div>
        </div>
        </div>

</template>

