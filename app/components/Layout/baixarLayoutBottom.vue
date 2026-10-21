<script setup lang="ts">
import { BadgePercent, Download, Smartphone } from 'lucide-vue-next'

const passos = [
  { icone: Smartphone, titulo: 'Tudo na palma da mão', desc: 'Encartes, ofertas e lista de compras — tudo em um só lugar, direto no seu celular.' },
  { icone: BadgePercent, titulo: 'Vantagens exclusivas', desc: 'Descontos em tempo real, economizômetro e promoções exclusivas para quem usa o app.' },
  { icone: Download, titulo: 'Como baixar?', desc: 'Abra a Play Store ou a App Store, busque por "Alô Pará", instale e comece a economizar.' },
]
</script>

<template>
  <section class="border-t border-(--borda) bg-(--bg-cartao)">
    <div class="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:px-8">
      <h2 class="text-2xl font-extrabold tracking-tight text-(--texto-primario) md:text-3xl">
        O que você ganha com o app
      </h2>
      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div v-for="p in passos" :key="p.titulo" class="rounded-2xl border border-(--borda) bg-(--bg-pagina) p-6">
          <span class="grid h-12 w-12 place-items-center rounded-2xl bg-(--marca-suave) text-red-600">
            <component :is="p.icone" :size="22" />
          </span>
          <h3 class="mt-5 text-lg font-bold text-(--texto-primario)">
            {{ p.titulo }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-(--texto-fraco)">
            {{ p.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
