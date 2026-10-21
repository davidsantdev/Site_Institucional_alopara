<script setup lang="ts">
import { FileText, MessageCircle, Phone, User } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

const nome = ref('')
const numero = ref('')
const mensagem = ref('')
const numeroCV = '5594992268984'

const completo = computed(() => Boolean(nome.value.trim() && numero.value.trim() && mensagem.value.trim()))

function enviar() {
  const texto = `Olá! Me chamo *${nome.value.trim()}* e gostaria de enviar meu currículo.\n\n${mensagem.value.trim()}\n\n📱 Contato: ${numero.value.trim()}`
  window.open(`https://wa.me/${numeroCV}?text=${encodeURIComponent(texto)}`, '_blank')
}

const campo = 'w-full rounded-xl border border-(--borda-forte) bg-(--bg-input) px-4 py-3 text-[15px] text-(--texto-primario) outline-none transition placeholder:text-(--texto-suave) focus:border-red-600 focus:ring-4 focus:ring-red-600/12'
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button
        type="button"
        class="inline-flex h-12 items-center rounded-full bg-red-600 px-6 font-semibold text-white shadow-sm shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.97]"
      >
        Enviar currículo
      </button>
    </DialogTrigger>

    <DialogContent class="w-[92vw] overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) p-0 md:w-120">
      <div class="border-b border-(--borda) px-7 pb-5 pt-7">
        <span class="text-xs font-semibold uppercase tracking-wide text-red-600">Trabalhe conosco</span>
        <h2 class="mt-1 text-2xl font-extrabold tracking-tight text-(--texto-primario)">
          Envie seu currículo
        </h2>
        <p class="mt-1.5 text-sm text-(--texto-fraco)">
          Preencha os dados e a mensagem vai pronta pro WhatsApp do nosso RH.
        </p>
      </div>

      <form class="flex flex-col gap-4 px-7 py-6" @submit.prevent="completo && enviar()">
        <label class="flex flex-col gap-1.5">
          <span class="flex items-center gap-1.5 text-sm font-medium text-(--texto-secundario)"><User :size="14" class="text-red-600" /> Nome completo</span>
          <input v-model="nome" type="text" autocomplete="name" placeholder="Seu nome" :class="campo">
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="flex items-center gap-1.5 text-sm font-medium text-(--texto-secundario)"><Phone :size="14" class="text-red-600" /> WhatsApp</span>
          <input v-model="numero" type="tel" autocomplete="tel" inputmode="tel" placeholder="(00) 00000-0000" :class="campo">
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="flex items-center gap-1.5 text-sm font-medium text-(--texto-secundario)"><FileText :size="14" class="text-red-600" /> Fale sobre você</span>
          <textarea v-model="mensagem" rows="4" placeholder="Experiências, disponibilidade, cargo desejado..." class="resize-none" :class="campo" />
        </label>

        <button
          type="submit"
          :disabled="!completo"
          class="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-700 font-semibold text-white transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MessageCircle :size="19" />
          Enviar pelo WhatsApp
        </button>
      </form>
    </DialogContent>
  </Dialog>
</template>
