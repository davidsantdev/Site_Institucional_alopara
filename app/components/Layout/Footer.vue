<script setup lang="ts">
import { Copy, Copyright } from 'lucide-vue-next';
import { Button } from '../ui/button';

</script>

<template>
    <div class="md:flex text-white  justify-between  md:p-20 pt-10 bg-[#121212] ">
        <div class="md:w-[40%] w-[100%] flex gap-5 flex-wrap">
            <div class="flex flex-col text-white">
                <h4 class="text-[25px]  p-3">Fale conosco</h4>
                <Button variant="link" class="text-[22px] font-light text-white"> Atacado</Button>
                <Button variant="link" class="text-[22px] font-light text-white">Compras</Button>
                <Button variant="link" class="text-[22px] font-light text-white">Crediario</Button>
                <Button variant="link" class="text-[22px] font-light text-white">Financeiro</Button>

            </div>
             <div class="flex flex-col text-white">
                <h4 class="text-[25px] p-3">Redes sociais</h4>
                <Button variant="link" class="text-[22px] font-light text-white"> Instagram</Button>
                <Button variant="link" class="text-[22px] font-light text-white">Facebook</Button>
 

            </div>
            <div class="flex flex-col text-white">
                <h4 class="text-[25px] p-3 text-center text-white">Informações </h4>
                <Button variant="link" class="text-[22px] font-ligh text-whitet"> Registre-se no Clube
                     </Button>
                <Button variant="link" class="text-[22px] font-ligh text-white">Vagas</Button>



            </div>

            <hr class="text-slate-50 w-full"/>
            

        </div>

        <div class="md:w-[50%] flex justify-center p-2">     
    <iframe
      class="w-[90%] h-[400px] rounded-xl "
      src="https://www.google.com/maps?q=-4.2520391,-49.9427902&hl=pt-BR&z=17&output=embed"
      style="border:0;"
      loading="lazy"
      allowfullscreen>
    </iframe>
         </div>

         


        </div>
        <div class="w-full bg-[#272727] h-25 flex items-center pl-30 justify-between">
            <div class="flex"><Copyright/> <p>2026 Todos os direitos reservados </p></div>
            <div class="flex "><img src="../../assets/img/alop.png" class="w-40" alt=""></div>
            

         </div>
    
</template>