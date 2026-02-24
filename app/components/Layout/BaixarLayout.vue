<script setup lang="ts">
import Button from '../ui/button/Button.vue';



</script>

<template>
    <div >
        
        
        <div class="text-slate-100 flex gap-10 flex-col ml-[100px] mt-[100px]">
            <h1 class="font-bold text-[90px]  w-[70%]">Baixe o nosso app </h1>
            
            
            <p class=" text-[19px] w-[700px] text-slate-300">O App Alô Pará traz mais praticidade para o seu dia a dia, permitindo acompanhar encartes atualizados,
                 ofertas exclusivas e promoções todos os dias direto no celular</p>
            <div class="mt-10 flex gap-10 ">
                <a href="https://play.google.com/store/apps/details?id=inovatech.mercafacil.supmercado.alo.para&hl=pt_BR"><Button variant="secondary" class="p-8 text-[20px] h-20">Baixar no Android  <span><img src="../../assets/img/Design sem nome.png" alt="" class="w-10"></span> </Button></a>

               <a href=" https://apps.apple.com/br/app/supermercado-al%C3%B4-par%C3%A1/id6737360207"> <Button variant="secondary" class="p-8 text-[20px] h-20">Baixar no IOS  <span><img src="../../assets/img/ios.png" alt="" class="w-10"></span> </Button></a>
 
               
            </div>
        </div>

    </div>
</template>