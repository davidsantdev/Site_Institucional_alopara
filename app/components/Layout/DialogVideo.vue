<script setup lang="ts">
import { Icon } from 'lucide-vue-next';
import Dialog from '../ui/dialog/Dialog.vue';
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
import DialogHeader from '../ui/dialog/DialogHeader.vue';

</script>

<template>
    <div>
        <Dialog>
            <DialogTrigger>
              <button class="bg-red-600 p-4 rounded-[50px] w-[200px] hover:bg-red-500 mt-10 ">Veja mais</button>
            </DialogTrigger>
             <DialogContent class="flex flex-col items-center text-center h-[80%] w-[80%] fixed">
               <DialogHeader>
              
                 <h2 class="text-[30px] text-center">CONTATO</h2>

                 <p> Escolha o departamento em que deseja entrar em contato</p>
                 </DialogHeader>
                 <div class="flex flex-col w-[90%] text-center gap-3 ">

 

                   

                 </div>

                 
              </DialogContent>


                

        </Dialog>
    </div>
</template>