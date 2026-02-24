<script setup lang="ts">

import { Menu } from 'lucide-vue-next';
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
        <header class="flex justify-between md:mx-20  text-[20px]  ">
            
            <div>
                <img src="../../assets/img/alop.png"" alt="" class="w-[180px] ">

            </div>

            <div class="md:flex gap-10 hidden">
                <button>
                   <NuxtLink to="/">Inicio</NuxtLink>
                </button>
                <button>
                    <NuxtLink to="/Baixar">Baixar app</NuxtLink>

                </button>
                

        <DropdownMenu>
    <DropdownMenuTrigger as-child>
        <button>
            Saiba mais <span class="mt-3"> <Icon name="lucide:chevron-down"  /></span>
        </button>


    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-40 h-100 mt-[-50px]" >
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





             <div class="md:hidden gap-10 flex">
               
                <Mobilemenu/>
 
          

            </div>
        </header>
        </div>

</template>

