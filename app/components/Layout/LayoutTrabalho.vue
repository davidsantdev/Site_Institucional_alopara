<script setup lang="ts">
import Button from '../ui/button/Button.vue';
import DialogCurriculo from './dialogCurriculo.vue';

</script>

<template>
    <div>
        <div class="flex justify-center items-center h-[40%] bg-slate-50 shadow">
            <div class="bg-red-500 rounded-[20px] w-[95%] md:w-[70%] h-[30%] flex justify-between items-center m-10" >
                
                <div class="p-10">
                    
                    <h4 class="font-bold text-[35px] md:text-[60px] text-slate-50">Junte-se a nós</h4>
                    <p class="md:w-[450px] w-[100%] text-[14px] text-slate-50">No Supermercado Alô Pará, acreditamos que nosso maior patrimônio são 
                        as pessoas. Se você é dedicado, gosta de trabalhar em equipe e quer crescer 
                        profissionalmente, venha fazer parte da nossa família!</p>

                        <div class="flex gap-5">
                            <DialogCurriculo/>
                            <Button class="mt-7 p-6 md:p-7 text-[13px] md:text-[18px]">Saiba mais</Button>

                        </div>

                </div>

                <div class="md:block hidden">
                    <img src="https://exato.digital/images/shared/img-home-recrutamento-min.png" alt="">
                </div>

            </div>

        </div>

        <div class="bg-slate-100 flex justify-center items-center  ">
            <div class="w-[100%] md:w-[80%] bg-white shadow rounded-[20px] md:m-40 mb-10 p-5 md:p-7 md:p-20 mt-10">
                <div>
                    <h4 class="font-bold text-[35px] md:text-[50px] text-slate-900">Quais vagas disponiveis? </h4>

                    <p class="text-slate-700 text-[15px] md:text-[18px] w-[100%] md:w-[700px] md:pt-6">No momento, nossas oportunidades
                         são divulgadas oficialmente 
                        através do nosso Instagram e também pelo nosso WhatsApp</p>

                        <div class="md:flex  justify-between pt-[60px] flex-wrap block">

                            <img class="w-[600px] rounded-[20px]" src="https://mercadoeconsumo.com.br/wp-content/uploads/2025/11/supermercado-envato-2-1140x570.webp" alt="">
                            <div class="md:flex md:flex-col justify-end items-end">

                                <h4 class="font-bold text-[35px] md:text-[50px] text-slate-900 text-end mt-10">O que exigimos?</h4>
                                
                                <p class="text-slate-700  text-[15px] md:text-[18px] w-[100%] md:w-[60%] t md:pt-6 text-end ">No Supermercado Alô Pará,
                                    buscamos pessoas comprometidas, responsáveis e com vontade de aprender e crescer junto
                                    com a nossa equipe. Não exigimos escolaridade completa, mas valorizamos dedicação, 
                                    respeito, boa comunicação e disposição para trabalhar em equipe.</p>
                                </div>

                        </div>

                       

                </div>
                 




            </div>
        

        </div>
        
    </div>
</template>