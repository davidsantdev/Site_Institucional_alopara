<script setup lang="ts">
import { Copy, Copyright } from 'lucide-vue-next';
import { Button } from '../ui/button';

</script>

<template>
    <div class="flex justify-between  p-20 bg-[#121212] ">
        <div class="w-[40%] flex gap-5 flex-wrap">
            <div class="flex flex-col">
                <h4 class="text-[25px] p-3">Fale conosco</h4>
                <Button variant="link" class="text-[22px] font-light"> Atacado</Button>
                <Button variant="link" class="text-[22px] font-light">Compras</Button>
                <Button variant="link" class="text-[22px] font-light">Crediario</Button>
                <Button variant="link" class="text-[22px] font-light">Financeiro</Button>

            </div>
             <div class="flex flex-col">
                <h4 class="text-[25px] p-3">Redes sociais</h4>
                <Button variant="link" class="text-[22px] font-light"> Instagram</Button>
                <Button variant="link" class="text-[22px] font-light">Facebook</Button>
 

            </div>
            <div class="flex flex-col">
                <h4 class="text-[25px] p-3 text-center">Informações </h4>
                <Button variant="link" class="text-[22px] font-light"> Registre-se no Clube
                     </Button>
                <Button variant="link" class="text-[22px] font-light">Vagas</Button>



            </div>

            <hr class="text-slate-50 w-full"/>
            

        </div>

        <div class="w-[50%]">     
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
            <div class="flex"><Copyright/> <p>Copyright 2026 Todos os direitos reservados </p></div>
            <div class="flex "><img src="../../assets/img/alop.png" class="w-40" alt=""></div>
            

         </div>
    
</template>