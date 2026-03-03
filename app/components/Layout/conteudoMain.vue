<script setup lang="ts">

import Button from '../ui/button/Button.vue';
import Dialog from '../ui/dialog/Dialog.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
import DialogHeader from '../ui/dialog/DialogHeader.vue';
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';

</script>

<template>
    <div >
        <div class="text-slate-100 flex flex-col items-center pt-30">
            <h1 class="font-bold text-[45px] md:text-[100px]">BEM VINDO AO </h1>
            <h1 class="font-bold text-[45px] md:text-[100px] text-red-600">ALÔ PARÁ </h1>
            
            <p class=" text-[15px] md:text-[22px] text-slate-300 md:w-[100%] w-[80%] text-center ">Há anos presente no dia a dia das famílias, levando qualidade, economia e confiança</p>
            <div class="mt-10 flex gap-10 justify-between">
                <Dialog>
                    <DialogTrigger>
                        <span></span>
                        <button class="bg-red-600 md:p-4 p-[12px] rounded-[50px] md:w-[200px] w-[150px] hover:bg-red-500 ">Entre em contato</button>
                    </DialogTrigger>
                     <DialogContent class="flex flex-col items-center text-center">
               <DialogHeader>
              
                 <h2 class="text-[30px] text-center">CONTATO</h2>

                 <p> Escolha o departamento em que deseja entrar em contato</p>
                 </DialogHeader>
                 <div class="flex flex-col w-[90%] text-center gap-3">
                    <Button variant="outline" class="p-6 text-[20px]">Atacado</Button>
                     <Button variant="outline" class="p-6 text-[20px]">Financeiro</Button>
                      <Button variant="outline" class="p-6 text-[20px]">Recursos Humanos Rh</Button>
                       <Button variant="outline" class="p-6 text-[20px]">Seja um fornecedor</Button>
                        <Button variant="outline" class="p-6 text-[20px]">Suporte</Button>




                 </div>

                 
              </DialogContent>


                </Dialog>

                <a href="#Sobre"><button class="border-[3px] md:p-4 rounded-[50px] md:w-[200px]  p-[12px] w-[150px] border-red-600 hover:bg-red-600">Sobre nos</button></a>
            </div>
        </div>

    </div>
</template>

<style scoped>
</style>