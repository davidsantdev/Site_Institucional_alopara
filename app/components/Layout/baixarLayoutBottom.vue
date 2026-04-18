<script setup lang="ts">

const categorias = [
  {titulo:"Tudo o que você precisa, na palma da sua mão", descricao:"Tudo o que você precisa, na palma da sua mão", num:"01."},
  {titulo:"Vantagens", descricao:"Tenha acesso aos encartes, descontos em tempo real, Mais praticidade e rapidez nas suas compras, Ofertas exclusivas para quem usa o app e muito mais", num:"02."},
  {titulo:"Como baixar?", descricao:"É rápido, fácil e gratuito: basta acessar a Play Store ou App Store, buscar por Alô Pará, instalar e começar a economizar. Tenha o mercado na palma da sua mão!", num:"03."}

]

</script>

<template>
    <div class="border-t p-10 border-[#1a1a1a]">
      <div class="flex items-center gap-4 mb-12">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">O que você está perdendo</span>
          <div class="flex-1 h-px bg-[#1f1f1f]" />
        </div>

      
      <div class="flex gap-3 flex-wrap justify-center ">
        
        
            <div
        v-for="cat in categorias"
        :key="cat.rota"
       
        class="group bg-[#161616] border border-[#1f1f1f] rounded-xl p-6 cursor-pointer
               flex flex-col gap-5 transition-all duration-250
               hover:border-red-600 hover:bg-[#1a0d0d] hover:-translate-y-1"
              
      >
      <span class="text-[20px] font-black tracking-[3px] text-red-600 uppercase">{{ cat.num }}</span>
   
 
       

        <!-- texto -->
        <div class="flex flex-col gap-1.5 w-100">
          <h3 class="text-white text-[28px] font-extrabold tracking-tight">{{ cat.titulo }}</h3>
          <p class="text-[#888888]  text-[21px] font-semibold tracking-wide uppercase">{{ cat.descricao }}</p>
        </div>

       
      </div>

      </div>


   


</div>
           

   
</template>

