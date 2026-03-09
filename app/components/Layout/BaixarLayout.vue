<script setup lang="ts">
import Button from '../ui/button/Button.vue';



</script>

<template>
    <div class="flex justify-between md:p-10 p-5 fundo-baixar text-center" >
        
        
        <div class="text-slate-100 flex gap-10 flex-col w-[100%] md:ml-[100px] md:mt-[100px] justify-center items-center">
            <h1 class="font-bold md:text-[90px] text-[55px] leading-none  md:w-[70%] ">Baixe o nosso app </h1>
            
            
            <p class=" md:text-[19px] text-[14px] md:w-[600px] text-slate-300">O App Alô Pará traz mais praticidade para o seu dia a dia, permitindo acompanhar encartes atualizados,
                 ofertas exclusivas e promoções todos os dias direto no celular</p>
            <div class="flex gap-4">

      <a href="https://play.google.com/store/apps/details?id=inovatech.mercafacil.supmercado.alo.para&hl=pt_BR">
        <Button variant="secondary" class="md:p-8 bg-zinc-800 text-white md:text-[20px] md:h-20 h-15 flex items-center gap-3">
          Baixar no Android
          <img src="../../assets/img/Design sem nome.png " class="w-8" alt="">
        </Button>
      </a>
      
         <a href="https://apps.apple.com/br/app/supermercado-al%C3%B4-par%C3%A1/id6737360207">
        <Button variant="secondary" class="bg-zinc-800 text-white md:p-8 md:text-[20px] md:h-20 h-15 flex items-center gap-3">
          Baixar no IOS
          <img src="../../assets/img/ios.png" class="w-8" alt="">
        </Button>
      </a>

      </div>
        </div>
        

    </div>
</template>

<style scoped>
.fundo-baixar{
    background-image: url(../../assets/img/baix.svg);
      background-size: cover;   
  background-position: center; 
  background-repeat: no-repeat; 

}


</style>