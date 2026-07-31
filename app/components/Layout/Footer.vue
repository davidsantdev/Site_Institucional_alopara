<script setup lang="ts">
import { Instagram, MessageCircle } from 'lucide-vue-next'
import DialogPoliticaPrivacidade from './DialogPoliticaPrivacidade.vue'
import DialogTermosUso from './DialogTermosUso.vue'
import Faqs from './Faqs.vue'

const contato = [
  { label: 'Atacado', href: '#' },
  { label: 'Compras', href: '#' },
  { label: 'Crediário', href: '#' },
  { label: 'Financeiro', href: '#' },
]

const redes = [
  { label: 'Instagram', href: 'https://instagram.com/supermercadoalopara', icone: Instagram },
  { label: 'WhatsApp', href: 'https://wa.me/5594991923141', icone: MessageCircle },
]

const info = [
  { label: 'Clube de descontos', href: 'https://cadastramento-alopara.mercafacil.com/home' },
  { label: 'Trabalhe conosco', href: '/trabalhe-conosco' },
  { label: 'Baixar app', href: '/Baixar' },
]
</script>

<template>
  <footer class="bg-[#0d0d0d] border-t border-[#1a1a1a]">
    <Faqs />

    <!-- corpo principal -->
    <div class="max-w-6xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 gap-14">
      <!-- coluna esquerda -->
      <div class="flex flex-col gap-10">
        <!-- logo + descrição -->
        <div>
          <p class="text-white text-[28px] font-black leading-none tracking-tight mb-2">
            <span class="text-red-600">Alô</span> Pará
          </p>
          <p class="text-[9px] font-black tracking-[4px] uppercase text-[#333] mb-5">
            Supermercado
          </p>
          <p class="text-[#444] text-[13px] leading-relaxed max-w-xs">
            Há mais de 20 anos levando qualidade, economia e confiança para as famílias paraenses.
          </p>
        </div>

        <!-- links em grid -->
        <div class="grid grid-cols-3 gap-8">
          <!-- CONTATO -->
          <div>
            <p class="text-[10px] font-black tracking-[3px] uppercase text-red-600 mb-4">
              Contato
            </p>
            <div class="flex flex-col gap-2">
              <a
                v-for="item in contato"
                :key="item.label"
                :href="item.href"
                class="text-[#555] text-[13px] font-semibold hover:text-white transition-colors duration-200"
              >
                {{ item.label }}
              </a>
            </div>
          </div>

          <!-- REDES -->
          <div>
            <p class="text-[10px] font-black tracking-[3px] uppercase text-red-600 mb-4">
              Redes
            </p>
            <div class="flex flex-col gap-2">
              <a
                v-for="item in redes"
                :key="item.label"
                :href="item.href"
                class="flex items-center gap-2 text-[#555] text-[13px] font-semibold hover:text-white transition-colors duration-200 group"
              >
                <component :is="item.icone" :size="13" class="group-hover:text-red-600 transition-colors" />
                {{ item.label }}
              </a>
            </div>
          </div>

          <!-- INFO -->
          <div>
            <p class="text-[10px] font-black tracking-[3px] uppercase text-red-600 mb-4">
              Informações
            </p>
            <div class="flex flex-col gap-2">
              <a
                v-for="item in info"
                :key="item.label"
                :href="item.href"
                class="text-[#555] text-[13px] font-semibold hover:text-white transition-colors duration-200"
              >
                {{ item.label }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- mapa -->
      <div class="flex flex-col gap-3">
        <p class="text-[10px] font-black tracking-[3px] uppercase text-red-600">
          Nossa localização
        </p>
        <div class="relative rounded-xl overflow-hidden border border-[#1f1f1f]">
          <iframe
            class="w-full h-[340px]"
            src="https://www.google.com/maps?q=-4.2520391,-49.9427902&hl=pt-BR&z=17&output=embed"
            style="border:0; filter: grayscale(60%) contrast(1.1);"
            loading="lazy"
            allowfullscreen
          />
        </div>
      </div>
    </div>

    <!-- barra inferior -->
    <div class="border-t border-[#1a1a1a] px-6 md:px-10 py-5 flex items-center justify-between flex-wrap gap-4">
      <p class="text-[#2a2a2a] text-[11px] font-bold tracking-[1px]">
        © 2026 Alô Pará · Todos os direitos reservados
      </p>
      <div class="flex items-center gap-6">
        <DialogPoliticaPrivacidade />
        <div class="w-px h-3 bg-[#2a2a2a]" />
        <DialogTermosUso />
        <div class="w-px h-3 bg-[#2a2a2a]" />
        <span class="text-[#2a2a2a] text-[11px] font-bold tracking-[1px] select-none">
          Coded by David S.
        </span>
      </div>
    </div>
  </footer>
</template>
