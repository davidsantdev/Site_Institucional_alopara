<script setup lang="ts">
import { Download, DownloadIcon, Home, Menu, PercentSquareIcon, PersonStanding, ShoppingCart, Tag, User2, UserPlus } from 'lucide-vue-next';
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
                    <DropdownMenuContent class="w-[250px] h-screen rounded-0 border-0 mt-[-4px] bg-slate-50 text-slate-800">
                        <div class="flex flex-col pt-7">


                           <Button @click="navigateTo('/')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">   <Home/> Inicio     </Button>

                            <DropdownMenuSeparator class="my-2 bg-slate-300"/>



                                <Button @click="navigateTo('/trabalhe-conosco')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">   <User2/> Trabalhe conosco    </Button>

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>



                                <Button @click="navigateTo('/Baixar')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3"> <DownloadIcon/>   Baixar app   </Button>



                                   <DropdownMenuSeparator class="my-2 bg-slate-300"/>

                                     <a href="https://cadastramento-alopara.mercafacil.com/home"> <Button class=" text-[14px] font-bold flex gap-3" variant="ghost"> Clube de descontos</Button> </a>

                                      <DropdownMenuSeparator class="my-2 bg-slate-300"/>
                                       <Button @click="navigateTo('/Alimentos')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">    Alimentos    </Button>

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>

                                 <Button @click="navigateTo('/Bebidas')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">    Bebidas   </Button>
                                 

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>

                                        <Button @click="navigateTo('/Vinhos')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">   Vinhos    </Button>

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>


                                 <Button @click="navigateTo('/LImpeza')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">    Limpeza   </Button>

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>

                                 <Button @click="navigateTo('/Perfumaria')" variant="ghost" class="h-13  text-[14px] font-bold flex gap-3">   Perfumaria   </Button>

                                <DropdownMenuSeparator class="my-2 bg-slate-300"/>

                                





                        </div>
                        
                    </DropdownMenuContent>



                </DropdownMenu>
    </div>
</template>