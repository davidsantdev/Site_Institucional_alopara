<script setup lang="ts">
import { Download, Home, Menu, PercentSquareIcon, PersonStanding, ShoppingCart, Tag, UserPlus } from 'lucide-vue-next';
import Button from '../ui/button/Button.vue';
import DropdownMenu from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';
import { Separator } from 'reka-ui';

</script>

<template>

    <div>
        <DropdownMenu>
                     <DropdownMenuTrigger as-child>
                    <Menu :size="75" class="p-3 mt-5"/>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-[250px] h-screen rounded-0  mt-[-4px]">
                        <div class="flex flex-col pt-7">


                            <Button variant="ghost" class="h-13  text-[14px] font-bold"> <Home/> Inicio</Button>

                            <DropdownMenuSeparator class="my-4"/>



                               <Button variant="ghost" class="h-13 font-bold text-[14px]"> <Download/> Baixar aplicativo</Button>

                                <DropdownMenuSeparator class="my-4"/>


                                  <Button variant="ghost" class="h-13 font-bold text-[14px]"> <UserPlus/> Vaga de emprego</Button>

                                   <DropdownMenuSeparator class="my-4"/>

                                    <Button variant="ghost" class="h-13 font-bold text-[14px]"> <Tag/> Clube de ofertas</Button>

                                      <DropdownMenuSeparator class="my-4"/>

                                       <Button variant="ghost" class="h-13 font-bold text-[14px]"> <ShoppingCart/> Compras online</Button>







                        </div>
                        
                    </DropdownMenuContent>



                </DropdownMenu>
    </div>
</template>