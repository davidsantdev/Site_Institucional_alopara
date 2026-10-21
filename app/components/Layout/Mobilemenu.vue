<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { ArrowUpRight, ChevronRight, Clock, Download, Home, Instagram, Menu, MessageCircle, Moon, Sun, User2, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import logo from '~/assets/img/web/logo.webp'
import { CATEGORIAS_LOJA, CONTATO, LINK_ENCARTES, linkWhatsapp } from '~/composables/useNavegacao'
import { useTema } from '~/composables/useTema'

const aberto = ref(false)
const { tema, alternar } = useTema()
const route = useRoute()

// Trava a rolagem da página por trás do menu (senão o fundo rola junto no celular).
const travado = useScrollLock(import.meta.client ? document.body : null)
watch(aberto, (v) => {
  travado.value = v
})

watch(() => route.fullPath, () => {
  aberto.value = false
})

onKeyStroke('Escape', () => {
  aberto.value = false
})

const institucional = [
  { label: 'Início', rota: '/', icone: Home },
  { label: LINK_ENCARTES.label, rota: LINK_ENCARTES.rota, icone: LINK_ENCARTES.icone },
  { label: 'Baixe o app', rota: '/Baixar', icone: Download },
  { label: 'Trabalhe conosco', rota: '/trabalhe-conosco', icone: User2 },
]
</script>

<template>
  <div>
    <button
      type="button"
      aria-label="Abrir menu"
      :aria-expanded="aberto"
      class="grid h-11 w-11 place-items-center rounded-full text-(--texto-primario) transition hover:bg-(--bg-elevado)"
      @click="aberto = true"
    >
      <Menu :size="22" />
    </button>

    <Teleport to="body">
      <Transition name="fundo">
        <div v-if="aberto" class="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px]" @click="aberto = false" />
      </Transition>

      <Transition name="gaveta">
        <aside
          v-if="aberto"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          class="fixed inset-y-0 right-0 z-61 flex w-85 max-w-[88vw] flex-col overflow-y-auto bg-(--bg-pagina) shadow-(--sombra-3)"
        >
          <div class="flex items-center justify-between border-b border-(--borda) px-5 py-4">
            <img :src="logo" alt="Supermercado Alô Pará" width="560" height="194" class="h-10 w-auto">
            <button
              type="button"
              aria-label="Fechar menu"
              class="grid h-10 w-10 place-items-center rounded-full text-(--texto-esmaecido) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
              @click="aberto = false"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Categorias -->
          <div class="px-3 pt-4">
            <p class="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-(--texto-fraco)">
              Categorias
            </p>
            <NuxtLink
              v-for="c in CATEGORIAS_LOJA"
              :key="c.rota"
              :to="c.rota"
              class="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-(--bg-elevado)"
              active-class="bg-(--marca-suave)"
            >
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl" :class="[c.fundo, c.rota === '/ofertas' ? 'text-red-600' : 'text-(--texto-primario)']">
                <component :is="c.icone" :size="18" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-semibold text-(--texto-primario)">{{ c.label }}</span>
                <span class="block text-xs text-(--texto-fraco)">{{ c.descricao }}</span>
              </span>
              <ChevronRight :size="16" class="text-(--texto-minimo)" />
            </NuxtLink>
          </div>

          <!-- Institucional -->
          <div class="mt-3 border-t border-(--borda) px-3 pt-3">
            <NuxtLink
              v-for="item in institucional"
              :key="item.rota"
              :to="item.rota"
              class="flex items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] font-medium text-(--texto-secundario) transition hover:bg-(--bg-elevado)"
            >
              <component :is="item.icone" :size="18" class="text-(--texto-fraco)" />
              {{ item.label }}
            </NuxtLink>
            <a
              :href="CONTATO.clube"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] font-medium text-(--texto-secundario) transition hover:bg-(--bg-elevado)"
            >
              <ArrowUpRight :size="18" class="text-(--texto-fraco)" />
              Clube de descontos
            </a>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-[15px] font-medium text-(--texto-secundario) transition hover:bg-(--bg-elevado)"
              @click="alternar"
            >
              <component :is="tema === 'claro' ? Moon : Sun" :size="18" class="text-(--texto-fraco)" />
              {{ tema === 'claro' ? 'Modo escuro' : 'Modo claro' }}
            </button>
          </div>

          <!-- Atendimento -->
          <div class="mt-auto border-t border-(--borda) p-5">
            <a
              :href="linkWhatsapp()"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 font-semibold text-white transition hover:bg-[#1fb658] active:scale-[0.98]"
            >
              <MessageCircle :size="19" />
              Falar no WhatsApp
            </a>
            <div class="mt-4 flex flex-col gap-2 text-sm text-(--texto-fraco)">
              <span class="flex items-center gap-2"><Clock :size="15" /> {{ CONTATO.horario }}</span>
              <a :href="CONTATO.instagram" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 transition hover:text-red-600">
                <Instagram :size="15" /> {{ CONTATO.instagramUsuario }}
              </a>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fundo-enter-active, .fundo-leave-active { transition: opacity 0.25s ease; }
.fundo-enter-from, .fundo-leave-to { opacity: 0; }
.gaveta-enter-active, .gaveta-leave-active { transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1); }
.gaveta-enter-from, .gaveta-leave-to { transform: translateX(100%); }
</style>
