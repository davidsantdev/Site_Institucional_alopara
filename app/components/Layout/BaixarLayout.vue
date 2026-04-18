<script setup lang="ts">
import Button from '../ui/button/Button.vue';



</script>

<template>
    <div class="flex justify-between  text-center" >
      <div class="flex justify-center items-center w-[100%]">

      
        
         <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-24">
      <div class="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600 opacity-[0.05] rounded-full pointer-events-none" />

      <div class="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-14">

        <div class="flex-1">
          <span class="inline-block bg-red-600 text-white text-[10px] font-black tracking-[3px] uppercase px-4 py-1.5 mb-6">
            APLICATIVO
          </span>

          <h1 class="text-white font-black text-[clamp(92px,9vw,100px)] leading-none tracking-tight mb-6">
            Baixe<br />
            <span class="text-red-600">o nosso</span><br />
            aplicativo
          </h1>

          <p class="text-[#666] text-[15px] leading-relaxed max-w-md mb-10">
            No Alô Pará, acreditamos que nosso maior patrimônio são as pessoas.
            Se você é dedicado e quer crescer profissionalmente, venha fazer
            parte da nossa família.
          </p>

          <div class="flex gap-4 flex-wrap">
           
            <a href="https://play.google.com/store/apps/details?id=inovatech.mercafacil.supmercado.alo.para&hl=pt_BR">
              <button class="border-2 border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white font-bold text-[13px] tracking-widest uppercase px-7 py-[14px] transition-all duration-200">
                Baixar no Android
              </button>
            </a>

            <a href="https://apps.apple.com/br/app/supermercado-al%C3%B4-par%C3%A1/id6737360207">
              <button class="border-2 border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white font-bold text-[13px] tracking-widest uppercase px-7 py-[14px] transition-all duration-200">
                Baixar no IOS
              </button>
            </a>
          </div>
        </div>

        <div class="flex-1 hidden md:flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 rounded-[100%] h-100 bg-red-600 opacity-10 rounded-2xl translate-x-3 translate-y-3" />
            <img
              src="../../assets/img/celulares.png"
              alt="Equipe Alô Pará"
              class="relative w-[400px] object-contain"
            />
          </div>
        </div>

      </div>
    </section>
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