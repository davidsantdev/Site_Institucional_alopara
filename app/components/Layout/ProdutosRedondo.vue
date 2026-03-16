<script setup lang="ts"></script>

<template>
    <div class="flex md:gap-10 gap-2 justify-center flex-wrap text-white">
        <div @click="navigateTo('/Alimentos')" class="md:w-60 w-40 flex justify-center text-[22px] items-center md:h-60 h-40 rounded-[100%] md:hover:text-[35px] transition-all duration-300 bg-[radial-gradient(circle_at_center,_#b91c1c_0%,_#7f1d1d_40%,_#450a0a_100%)] hover:bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#b91c1c_40%,_#7f1d1d_100%)] md:hover:w-70 md:hover:h-70 ">
            <div class="font-semibold text-center ">
                <h4>Alimentos</h4>
               
                <img class="md:w-[2050px] w-[400px]"  src="../../assets/img/produtos-redondo/alimentos.png" alt="">
            </div>
            
        </div>

        <div class="md:w-60 w-40 flex justify-center text-[22px] items-center md:h-60 h-40 rounded-[100%] md:hover:text-[35px] transition-all duration-300 bg-[radial-gradient(circle_at_center,_#b91c1c_0%,_#7f1d1d_40%,_#450a0a_100%)] hover:bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#b91c1c_40%,_#7f1d1d_100%)] md:hover:w-70 md:hover:h-70 ">
            <div @click="navigateTo('/Perfumaria')" class="font-semibold text-center ">
                <h4>Perfumaria</h4>
               
                <img class="md:w-[2050px] w-[90px]"  src="../../assets/img/produtos-redondo/perfumaria.png" alt="">
            </div>
            
        </div>

         <div class="md:w-60 w-40 flex justify-center text-[22px] items-center md:h-60 h-40 rounded-[100%] md:hover:text-[35px] transition-all duration-300 bg-[radial-gradient(circle_at_center,_#b91c1c_0%,_#7f1d1d_40%,_#450a0a_100%)] hover:bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#b91c1c_40%,_#7f1d1d_100%)] md:hover:w-70 md:hover:h-70 ">
            <div @click="navigateTo('/Limpeza')" class="font-semibold text-center ">
                <h4>Limpeza</h4>
               
                <img class="md:w-[150px] w-[100px]"  src="../../assets/img/produtos-redondo/limpeza.png" alt="">
            </div>
            
        </div>

        
        <div class="md:w-60 w-40 flex justify-center text-[22px] items-center md:h-60 h-40 rounded-[100%] md:hover:text-[35px] transition-all duration-300 bg-[radial-gradient(circle_at_center,_#b91c1c_0%,_#7f1d1d_40%,_#450a0a_100%)] hover:bg-[radial-gradient(circle_at_center,_#ef4444_0%,_#b91c1c_40%,_#7f1d1d_100%)] md:hover:w-70 md:hover:h-70 ">
            <div @click="navigateTo('/Bebidas')" class="font-semibold text-center ">
                <h4>Bebidas</h4>
               
                <img class="md:w-[160px] w-[100px]"  src="../../assets/img/produtos-redondo/bebidas.png" alt="">
            </div>
            
        </div>
    </div>
    
</template>