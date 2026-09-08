<script setup lang="ts">
import { Newspaper, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import Footer from '~/components/Layout/Footer.vue'
import HeaderMain from '~/components/Layout/HeaderMain.vue'

useSeoMeta({
  title: 'Encartes | Alô Pará',
  description: 'Confira o encarte de ofertas do Supermercado Alô Pará, em Novo Repartimento - PA.',
  ogTitle: 'Encartes | Alô Pará',
  ogDescription: 'Confira o encarte de ofertas do Supermercado Alô Pará.',
})

interface Encarte {
  id: string
  titulo: string
  arquivo: string
  criadoEm: number
}

const encartes = ref<Encarte[]>([])
const carregando = ref(true)
const erro = ref(false)
const selecionado = ref<Encarte | null>(null)

function urlEncarte(e: Encarte) {
  return `/uploads/encartes/${e.arquivo}`
}

function formatarData(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function carregar() {
  carregando.value = true
  erro.value = false
  try {
    const r = await $fetch<{ encartes: Encarte[] }>('/api/encartes')
    encartes.value = r.encartes
  }
  catch {
    erro.value = true
  }
  finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="min-h-screen bg-(--bg-pagina) flex flex-col font-sans">
    <HeaderMain />

    <!-- ═════ HERO ═════ -->
    <div class="relative overflow-hidden bg-(--bg-pagina) px-4 py-12 md:py-16 text-center border-b border-(--borda)">
      <div class="pointer-events-none absolute top-[-180px] left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 opacity-20 blur-3xl" />

      <div class="relative mx-auto max-w-3xl">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-[3px] text-white">
          <Newspaper :size="14" />
          Alô Pará Supermercado
        </div>

        <h1 class="mt-2 text-3xl font-black tracking-tight text-(--texto-primario) md:text-5xl">
          Encartes
        </h1>

        <p class="mt-3 text-sm text-(--texto-fraco) md:text-base">
          Acompanhe as promoções da semana direto por aqui
        </p>
      </div>
    </div>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
      <!-- ═════ SKELETON ═════ -->
      <div v-if="carregando" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao)">
          <div class="aspect-3/4 animate-pulse bg-(--bg-elevado)" />
        </div>
      </div>

      <!-- ═════ ERRO ═════ -->
      <div v-else-if="erro" class="flex flex-col items-center py-24 text-(--texto-suave)">
        <p>Não foi possível carregar os encartes agora.</p>
        <button
          type="button"
          class="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          @click="carregar"
        >
          Tentar novamente
        </button>
      </div>

      <!-- ═════ VAZIO ═════ -->
      <div v-else-if="encartes.length === 0" class="flex flex-col items-center py-24 text-center text-(--texto-suave)">
        <Newspaper :size="48" class="mb-4 opacity-30" />
        <p class="text-lg font-medium text-(--texto-esmaecido)">
          Nenhum encarte publicado no momento
        </p>
        <p class="mt-1 text-sm">
          Volte em breve pra conferir as próximas ofertas.
        </p>
      </div>

      <!-- ═════ GRID ═════ -->
      <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="e in encartes"
          :key="e.id"
          type="button"
          class="group overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-red-600"
          @click="selecionado = e"
        >
          <div class="aspect-3/4 overflow-hidden bg-(--bg-elevado)">
            <img
              :src="urlEncarte(e)"
              :alt="e.titulo"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            >
          </div>
          <div class="p-4">
            <p class="truncate text-sm font-bold text-(--texto-primario)">
              {{ e.titulo }}
            </p>
            <p class="mt-0.5 text-xs text-(--texto-suave)">
              {{ formatarData(e.criadoEm) }}
            </p>
          </div>
        </button>
      </div>
    </main>

    <!-- ═════ MODAL ═════ -->
    <Transition name="modal">
      <div
        v-if="selecionado"
        role="dialog"
        aria-modal="true"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="selecionado = null"
      >
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="selecionado = null" />

        <div class="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-(--borda) bg-(--bg-cartao) shadow-2xl">
          <button
            type="button"
            aria-label="Fechar"
            class="absolute top-3 right-3 z-10 rounded-full border border-white/10 bg-black/60 p-2 text-white/80 transition hover:text-white"
            @click="selecionado = null"
          >
            <X :size="18" />
          </button>
          <img :src="urlEncarte(selecionado)" :alt="selecionado.titulo" class="w-full h-auto">
          <div class="border-t border-(--borda) p-4">
            <p class="font-bold text-(--texto-primario)">
              {{ selecionado.titulo }}
            </p>
            <p class="text-xs text-(--texto-suave)">
              {{ formatarData(selecionado.criadoEm) }}
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <Footer />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .relative { transform: translateY(40px); }
</style>
