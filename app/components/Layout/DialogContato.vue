<script setup lang="ts">
import { Handshake, Headset, ShoppingCart, Users, Wallet } from 'lucide-vue-next'
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

interface Departamento {
  label: string
  telefone: string
  numero: string
  icone: typeof ShoppingCart
  mensagem: string
}

const departamentos: Departamento[] = [
  {
    label: 'Atacado',
    telefone: '94 99192-3141',
    numero: '5594991923141',
    icone: ShoppingCart,
    mensagem: 'Olá! Vim pelo site do Alô Pará e gostaria de falar sobre compras no atacado.',
  },
  {
    label: 'Financeiro',
    telefone: '94 99208-0029',
    numero: '5594992080029',
    icone: Wallet,
    mensagem: 'Olá! Vim pelo site do Alô Pará e gostaria de falar com o setor Financeiro.',
  },
  {
    label: 'Seja um fornecedor',
    telefone: '94 99150-3593',
    numero: '5594991503593',
    icone: Handshake,
    mensagem: 'Olá! Vim pelo site do Alô Pará e gostaria de ser um fornecedor.',
  },
  {
    label: 'Suporte',
    telefone: '94 8136-9236',
    numero: '559481369236',
    icone: Headset,
    mensagem: 'Olá! Vim pelo site do Alô Pará e preciso de suporte.',
  },
  {
    label: 'Recursos Humanos',
    telefone: '94 99226-8984',
    numero: '5594992268984',
    icone: Users,
    mensagem: 'Olá! Vim pelo site do Alô Pará e gostaria de falar com o RH.',
  },
]

function abrirWhatsapp(dep: Departamento) {
  window.open(`https://wa.me/${dep.numero}?text=${encodeURIComponent(dep.mensagem)}`, '_blank')
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button
        type="button"
        class="bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all
          text-white font-bold text-sm tracking-widest uppercase
          px-8 py-[14px] rounded-[4px]"
      >
        Entre em contato
      </button>
    </DialogTrigger>

    <DialogContent class="bg-[#111] border border-[#1f1f1f] p-0 w-[92vw] md:w-[440px] overflow-hidden rounded-2xl">
      <!-- header -->
      <div class="px-7 pt-7 pb-6 border-b border-[#1a1a1a]">
        <span class="text-red-600 text-[10px] font-black tracking-[3px] uppercase">Alô Pará</span>
        <h2 class="text-white text-[24px] font-black tracking-tight mt-1 leading-none">
          Fale com a gente
        </h2>
        <p class="text-[#666] text-[13px] mt-2">
          Escolha o departamento e continue direto no WhatsApp.
        </p>
      </div>

      <!-- departamentos -->
      <div class="px-5 py-5 flex flex-col gap-2">
        <button
          v-for="dep in departamentos"
          :key="dep.label"
          type="button"
          class="flex items-center gap-4 bg-[#161616] border border-[#1f1f1f] rounded-xl px-4 py-3.5 hover:border-red-600 transition-colors duration-200 group text-left"
          @click="abrirWhatsapp(dep)"
        >
          <div class="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
            <component :is="dep.icone" :size="18" class="text-red-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-[14px] font-bold">
              {{ dep.label }}
            </p>
            <p class="text-[#555] text-[12px]">
              {{ dep.telefone }}
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            class="text-[#333] group-hover:text-red-600 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          >
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
