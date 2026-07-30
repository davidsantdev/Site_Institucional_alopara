<script setup lang="ts">
const passos = [
  { num: '01', titulo: 'Tudo na palma da mão', desc: 'Encartes, ofertas e lista de compras — tudo em um só lugar, direto no seu celular.' },
  { num: '02', titulo: 'Vantagens exclusivas', desc: 'Descontos em tempo real, economizômetro e promoções exclusivas para quem usa o app.' },
  { num: '03', titulo: 'Como baixar?', desc: 'Acesse a Play Store ou App Store, busque por "Alô Pará", instale e comece a economizar.' },
]
</script>

<template>
  <div class="border-t border-[#1a1a1a] px-6 md:px-10 py-20">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center gap-4 mb-12">
        <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">O que você está perdendo</span>
        <div class="flex-1 h-px bg-[#1f1f1f]" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          v-for="passo in passos"
          :key="passo.num"
          class="bg-[#161616] border border-[#1f1f1f] rounded-xl p-7 flex flex-col gap-5 hover:border-red-600 transition-colors duration-300 group"
        >
          <span class="text-[11px] font-black tracking-[3px] text-red-600 uppercase">{{ passo.num }}</span>

          <div>
            <h3 class="text-white text-[20px] font-black tracking-tight mb-2">
              {{ passo.titulo }}
            </h3>
            <div class="w-6 h-0.5 bg-red-600 mb-4 transition-all duration-300 group-hover:w-12" />
            <p class="text-[#555] text-[13px] leading-relaxed">
              {{ passo.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
