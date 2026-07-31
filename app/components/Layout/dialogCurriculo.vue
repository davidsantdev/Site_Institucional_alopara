<script setup lang="ts">
import { ref } from 'vue'
import { Send, User, Phone, FileText } from 'lucide-vue-next'
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

const nome = ref('')
const numero = ref('')
const mensagem = ref('')
const numeroCV = '5594992268984'

function enviar() {
  const texto = `Olá! Me chamo *${nome.value}* e gostaria de enviar meu currículo.\n\n${mensagem.value}\n\n📱 Contato: ${numero.value}`
  window.open(`https://wa.me/${numeroCV}?text=${encodeURIComponent(texto)}`, '_blank')
}
</script>

<template>
  <div>
    <Dialog>

      <DialogTrigger as-child>
        <button class="bg-red-600 hover:bg-red-500 active:scale-[0.98] transition-all text-white font-bold text-[13px] tracking-widest uppercase px-8 py-[14px] mt-7">
          Enviar currículo
        </button>
      </DialogTrigger>

      <DialogContent class="bg-[#111] border border-[#1f1f1f] p-0 w-[92vw] md:w-[480px] overflow-hidden rounded-2xl">

        <!-- header -->
        <div class="px-7 pt-7 pb-6 border-b border-[#1a1a1a]">
          <span class="text-red-600 text-[10px] font-black tracking-[3px] uppercase">Trabalhe conosco</span>
          <h2 class="text-white text-[24px] font-black tracking-tight mt-1 leading-none">
            Envie seu currículo
          </h2>
          <p class="text-[#444] text-[13px] mt-2">
            Preencha os dados abaixo e enviaremos via WhatsApp para o nosso RH.
          </p>
        </div>

        <!-- formulário -->
        <div class="px-7 py-6 flex flex-col gap-5">

          <!-- nome -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-black tracking-[2px] uppercase text-[#555] flex items-center gap-2">
              <User :size="11" class="text-red-600" /> Nome completo
            </label>
            <input
              v-model="nome"
              type="text"
              placeholder="Seu nome"
              class="bg-[#161616] border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-[#333] focus:border-red-600 transition-colors duration-200 w-full"
            />
          </div>

          <!-- número -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-black tracking-[2px] uppercase text-[#555] flex items-center gap-2">
              <Phone :size="11" class="text-red-600" /> WhatsApp
            </label>
            <input
              v-model="numero"
              type="tel"
              placeholder="(00) 00000-0000"
              class="bg-[#161616] border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-[#333] focus:border-red-600 transition-colors duration-200 w-full"
            />
          </div>

          <!-- mensagem -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-black tracking-[2px] uppercase text-[#555] flex items-center gap-2">
              <FileText :size="11" class="text-red-600" /> Fale sobre você
            </label>
            <textarea
              v-model="mensagem"
              rows="4"
              placeholder="Experiências, disponibilidade, cargo desejado..."
              class="bg-[#161616] border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-[#333] focus:border-red-600 transition-colors duration-200 w-full resize-none"
            />
          </div>

          <!-- botão enviar -->
          <button
            @click="enviar"
            :disabled="!nome || !numero || !mensagem"
            class="mt-1 w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5a] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 text-white font-black text-[13px] tracking-widest uppercase py-4 rounded-xl"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar pelo WhatsApp
          </button>

        </div>

      </DialogContent>
    </Dialog>
  </div>
</template>