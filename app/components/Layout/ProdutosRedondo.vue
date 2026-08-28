<script setup lang="ts">
import alimentosImg from '@/assets/img/produtos-redondo/alimentos.png'
import bebidasImg from '@/assets/img/produtos-redondo/bebidas.png'
import limpezaImg from '@/assets/img/produtos-redondo/limpeza.png'
import perfumariaImg from '@/assets/img/produtos-redondo/perfumaria.png'

// `rota` e `desc` faltavam: os cards chamavam navigateTo(undefined),
// então clicar numa categoria da home não levava a lugar nenhum.
// As cores seguem o mesmo tema de cada página de categoria (ver PaginaCategoria).
const categorias = [
  {
    titulo: 'Alimentos',
    desc: 'Mercearia & hortifruti',
    rota: '/Alimentos',
    img: alimentosImg,
    hover: 'hover:border-red-600/60 hover:bg-red-600/5',
    texto: 'group-hover:text-red-500',
    aro: 'group-hover:bg-red-600 group-hover:border-red-600',
    glow: 'from-red-600 via-red-500 to-orange-500',
  },
  {
    titulo: 'Bebidas',
    desc: 'Sucos, cervejas & mais',
    rota: '/Bebidas',
    img: bebidasImg,
    hover: 'hover:border-cyan-500/60 hover:bg-cyan-500/5',
    texto: 'group-hover:text-cyan-400',
    aro: 'group-hover:bg-cyan-500 group-hover:border-cyan-500',
    glow: 'from-cyan-500 via-sky-500 to-blue-600',
  },
  {
    titulo: 'Limpeza',
    desc: 'Casa & lavanderia',
    rota: '/Limpeza',
    img: limpezaImg,
    hover: 'hover:border-blue-500/60 hover:bg-blue-500/5',
    texto: 'group-hover:text-blue-400',
    aro: 'group-hover:bg-blue-500 group-hover:border-blue-500',
    glow: 'from-blue-600 via-blue-500 to-cyan-400',
  },
  {
    titulo: 'Perfumaria',
    desc: 'Beleza & cuidados',
    rota: '/Perfumaria',
    img: perfumariaImg,
    hover: 'hover:border-pink-500/60 hover:bg-pink-500/5',
    texto: 'group-hover:text-pink-400',
    aro: 'group-hover:bg-pink-500 group-hover:border-pink-500',
    glow: 'from-pink-500 via-rose-400 to-fuchsia-500',
  },
]
</script>

<template>
  <section class="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-14">
    <!-- título da seção -->
    <div class="flex items-center gap-4 mb-6 md:mb-10">
      <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Categorias</span>
      <div class="flex-1 h-px bg-(--borda)" />
    </div>

    <!-- grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div
        v-for="cat in categorias"
        :key="cat.rota"
        role="link"
        tabindex="0"
        :aria-label="cat.titulo"
        class="group relative overflow-hidden bg-(--bg-cartao) border border-(--borda) rounded-2xl p-4 sm:p-5 md:p-6 cursor-pointer
               flex flex-col gap-4 md:gap-5 transition-all duration-300
               hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        :class="cat.hover"
        @click="navigateTo(cat.rota)"
        @keydown.enter="navigateTo(cat.rota)"
      >
        <!-- brilho de fundo -->
        <div
          class="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
          :class="cat.glow"
        />

        <!-- imagem -->
        <div class="relative aspect-square w-full max-w-26 mx-auto md:max-w-37.5">
          <img
            :src="cat.img"
            :alt="cat.titulo"
            class="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          >
        </div>

        <!-- texto -->
        <div class="relative flex flex-col gap-1 md:gap-1.5">
          <h3 class="text-(--texto-primario) text-[15px] md:text-[18px] font-extrabold tracking-tight transition-colors duration-200" :class="cat.texto">
            {{ cat.titulo }}
          </h3>
          <p class="text-(--texto-suave) text-[10px] md:text-[11px] font-semibold tracking-wide uppercase truncate">
            {{ cat.desc }}
          </p>
        </div>

        <!-- rodapé -->
        <div class="relative flex items-center justify-between pt-3 md:pt-4 border-t border-(--borda) mt-auto">
          <span class="text-(--texto-minimo) text-[10px] md:text-[11px] font-bold tracking-[1.5px] uppercase transition-colors duration-200" :class="cat.texto">
            Ver todos
          </span>
          <div
            class="w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-full border border-(--borda-forte) flex items-center justify-center transition-all duration-200"
            :class="cat.aro"
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
              class="text-(--texto-minimo) group-hover:text-white transition-colors duration-200"
            >
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
