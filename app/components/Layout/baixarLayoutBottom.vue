<script setup lang="ts">
</script>

<template>
    <div>
        
        <div class="flex pt-30 md:w-[90%] w-[95%] justify-center flex-wrap text-center">
            <div class="md:w-[50%]">
                <h3 class="font-semibold md:text-[36px] text-[25px] text-white">Tudo o que você precisa, na palma da sua mão</h3>
                <p class="md:text-[20px] text-[15px] md:w-[80%] text-gray-200 font-light">Com o app do Alô Pará, você acompanha ofertas exclusivas, encartes atualizados, descontos
                     especiais e muito mais, tudo de forma rápida, prática e gratuita</p>

                     <h3 class="font-semibold md:text-[36px] text-[25px] md:pt-5 pt-10 text-white">Vantagens</h3>
                <p class="md:text-[20px] text-[15px] md:w-[80%] text-gray-200 font-light">Tenha acesso aos encartes, descontos em tempo real, Mais praticidade e rapidez 
                    nas suas compras, Ofertas exclusivas para quem usa o app  e muito mais </p>

                     <h3 class="font-semibold md:text-[36px] text-[25px] md:pt-5 pt-10 text-white">Como baixar?</h3>
                     <p class="md:text-[20px] text-[15px] md:w-[80%] text-gray-200 font-light">É rápido, fácil e gratuito: basta acessar a Play Store ou App Store, buscar por Alô Pará,
                         instalar e começar a economizar. Tenha o mercado na palma da sua mão! </p>

                    

                    
            </div>

            <div>
                <img src="../../assets/img/celular.png" class="w-110" alt="">

              
            </div>
          

        </div>
         <div class="flex flex-col md:flex-row items-center justify-center mt-[50px] p-3 gap-10">

  <img src="../../assets/img/celulares.png" class="md:w-140 w-[80%]" alt="">

  <div class="text-slate-100 flex flex-col flex-wrap gap-6 md:ml-[100px] text-center md:text-left">

    <h2 class="font-bold md:text-[90px] text-[55px] leading-none">
      Baixe agora
    </h2>

    <p class="md:text-[20px] text-[15px] md:w-[500px] text-gray-200 font-light">
      O App Alô Pará traz mais praticidade para o seu dia a dia, permitindo acompanhar encartes atualizados,
      ofertas exclusivas e promoções todos os dias direto no celular
    </p>

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

</div>
           

   
</template>

<style scoped>
.fundo-baixar{
    background-image: url(../../assets/img/bg-baixar.jpg);
      background-size: cover;   /* cobre toda a div */
  background-position: center; /* centraliza */
  background-repeat: no-repeat; /* não repete a imagem */
  width: 100%;
  height: 50vh; /* ocupa toda a altura da tela */
}</style>