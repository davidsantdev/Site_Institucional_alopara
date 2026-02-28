<script setup lang="ts">
import Alimentos from './alimentos.vue';
import CarousselSobre from './CarousselSobre.vue';
import DialogVideo from './DialogVideo.vue';
import Produtos from './Produtos.vue';


</script>

<template>
    <div >
        <div class="flex justify-center p-15">
            <CarousselSobre/>

        </div>
        <div class="bg-slate-50">
           <Produtos/>
         </div>
        








         <h4 class="font-bold text-[60px] text-center pt-10 p-10">Conheça a nossa historia  </h4>

         <div class="flex w-[90%] justify-center ">
            <div class="w-[40%]">
                <h4 class="font-bold text-[40px] pt-7 " id="Sobre">Sobre </h4>
                <p class="text-[17px]" >
                   Fundado em 2004, o Alô Pará completa 22 anos fazendo parte
                    da história e da mesa das famílias da nossa região. Mais do que um supermercado, somos um parceiro do dia a dia, construído com confiança, respeito e compromisso com cada cliente.

                    Ao longo dessas duas décadas, crescemos junto com a
                     comunidade, sempre mantendo o que é mais importante:
                      preço justo, qualidade e atendimento de verdade.

                     Trabalhamos diariamente para oferecer produtos 
                     selecionados, variedade, economia real e 
                     uma experiência de compra simples e agradável.
                      Nossa equipe é preparada para atender com atenção,
                       agilidade e dedicação, porque entendemos que 
                       cada cliente é único.
                </p>

            </div>

            <div class="w-[50%]"  data-aos="fade-left">
                <img src="../../assets/img/image 954.png" class="w-[1000px]" alt="">
            </div>

         </div>
         <div class="flex  justify-center mt-30 pb-40">
            <div class="w-[45%]">
                <img src="../../assets/img/qualidade.jpg"  data-aos="fade-right" class="w-[90%] rounded-[20px]" alt="">
            </div>
            <div class="w-[40%]">
                <h4 class="font-bold text-[40px] pt-7 " id="Sobre">Nosso trabalho social </h4>
                <p class="text-[17px]" >
                 No Supermercado Alô Pará, o trabalho social integra nossa atuação de forma responsável
                  e contínua. Entendemos que nosso papel vai além da atividade comercial, envolvendo 
                  também o compromisso com o desenvolvimento social e o fortalecimento da comunidade onde
                   estamos inseridos.
                   <hr/>

                      Entre as iniciativas realizadas, promovemos ações como bingos comunitários, 
                      sorteios durante o Feirão 48 Horas e campanhas como o sorteio de casa mobiliada.
                       Essas atividades são estruturadas com foco na participação da população, buscando
                        incentivar o engajamento, proporcionar oportunidades e contribuir de maneira 
                        concreta para o bem-estar das famílias.
                </p>

                <DialogVideo/>

                

            </div>

         </div>



        

    </div>
</template>