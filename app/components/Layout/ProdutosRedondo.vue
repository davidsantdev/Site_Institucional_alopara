<script setup lang="ts">
import alimentosImg from '@/assets/img/produtos-redondo/alimentos.png'
import bebidasImg from '@/assets/img/produtos-redondo/bebidas.png'
import limpezaImg from '@/assets/img/produtos-redondo/limpeza.png'
import perfumariaImg from '@/assets/img/produtos-redondo/perfumaria.png'

const categorias = [
  { titulo: 'Alimentos', img: alimentosImg },
  { titulo: 'Bebidas', img: bebidasImg },
  { titulo: 'Limpeza', img: limpezaImg },
  { titulo: 'Perfumaria', img: perfumariaImg },
]
</script>

<template>
  <section class="bg-[#111] px-0 md:px-10 py-14">

    <!-- título da seção -->
    <div class="flex items-center gap-4 mb-10">
      <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Categorias</span>
      <div class="flex-1 h-px bg-[#1f1f1f]" />
    </div>

    <!-- grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div
        v-for="cat in categorias"
        :key="cat.rota"
        @click="navigateTo(cat.rota)"
        class="group bg-[#161616] border border-[#1f1f1f] rounded-xl p-6 cursor-pointer
               flex flex-col gap-5 transition-all duration-250
               hover:border-red-600 hover:bg-[#1a0d0d] hover:-translate-y-1"
              
      >
   
        <!-- imagem -->
        <img
          :src="cat.img"
          :alt="cat.titulo"
          class="md:w-50 md:h-50  w-60 h-30 object-contain transition-transform  duration-300 group-hover:scale-110"
        />

        <!-- texto -->
        <div class="flex flex-col gap-1.5">
          <h3 class="text-white text-[18px] font-extrabold tracking-tight">{{ cat.titulo }}</h3>
          <p class="text-[#444] text-[11px] font-semibold tracking-wide uppercase">{{ cat.desc }}</p>
        </div>

        <!-- rodapé -->
        <div class="flex items-center justify-between pt-4 border-t border-[#1f1f1f] mt-auto">
          <span class="text-[#333] text-[11px] font-bold tracking-[1.5px] uppercase transition-colors duration-200 group-hover:text-red-600">
            Ver todos
          </span>
          <div class="w-7 h-7 rounded-full border border-[#2a2a2a] flex items-center justify-center transition-all duration-200 group-hover:bg-red-600 group-hover:border-red-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              class="text-[#444] group-hover:text-white transition-colors duration-200">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>