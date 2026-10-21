<script setup lang="ts">
/**
 * Escolher a foto de um produto num banco de fotos grátis (Pexels) — pra
 * quem não tem código de barras (hortifruti, açougue). Mostra sugestões pela
 * busca e só grava a que a pessoa escolher: nunca escolhe sozinho.
 */
import { onKeyStroke } from '@vueuse/core'
import { Check, ImageOff, LoaderCircle, Search, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { formatarNome } from '~/composables/useFormatacao'

interface FotoBanco {
  id: number
  miniatura: string
  original: string
  alt: string
  autor: string
  autorUrl: string
  pagina: string
}

const props = defineProps<{
  produto: { id: string, nome: string } | null
}>()

const emit = defineEmits<{
  fechar: []
  escolhida: [imagem: string]
}>()

const termo = ref('')
const fotos = ref<FotoBanco[]>([])
const carregando = ref(false)
const erro = ref('')
const selecionada = ref<FotoBanco | null>(null)
const salvando = ref(false)

/** "CARNE PICANHA A BOVINO" → "carne picanha": as duas primeiras palavras, sem número/medida. */
function termoSugerido(nome: string): string {
  return formatarNome(nome)
    .split(' ')
    .filter(p => /^\p{L}{3,}$/u.test(p))
    .slice(0, 2)
    .join(' ')
    .toLowerCase()
}

async function buscar() {
  const t = termo.value.trim()
  if (!t)
    return
  carregando.value = true
  erro.value = ''
  selecionada.value = null
  try {
    const r = await $fetch<{ fotos: FotoBanco[] }>('/api/admin/imagens/buscar', { query: { q: t } })
    fotos.value = r.fotos
  }
  catch (e: any) {
    fotos.value = []
    erro.value = e?.data?.statusMessage || 'Erro ao buscar fotos'
  }
  finally {
    carregando.value = false
  }
}

async function usar() {
  if (!props.produto || !selecionada.value)
    return
  salvando.value = true
  try {
    const r = await $fetch<{ imagem: string }>(`/api/admin/produtos/${props.produto.id}/imagem-pexels`, {
      method: 'POST',
      body: { original: selecionada.value.original },
    })
    toast.success('Foto atualizada', { description: formatarNome(props.produto.nome) })
    emit('escolhida', r.imagem)
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao salvar a foto')
  }
  finally {
    salvando.value = false
  }
}

// Abriu pra um produto: já busca pelo nome dele.
watch(() => props.produto, (p) => {
  if (!p)
    return
  termo.value = termoSugerido(p.nome)
  fotos.value = []
  erro.value = ''
  selecionada.value = null
  buscar()
}, { immediate: true })

onKeyStroke('Escape', () => {
  if (props.produto && !salvando.value)
    emit('fechar')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="produto" class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true" aria-label="Buscar foto do produto">
        <div class="absolute inset-0 bg-black/75 backdrop-blur-sm" @click="!salvando && emit('fechar')" />

        <div class="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] text-white shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-[#222] px-5 py-4">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-wide text-[#666]">
                Buscar foto
              </p>
              <h2 class="truncate text-lg font-bold">
                {{ formatarNome(produto.nome) }}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Fechar"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#888] transition hover:bg-[#222] hover:text-white"
              @click="emit('fechar')"
            >
              <X :size="18" />
            </button>
          </div>

          <form class="flex gap-2 px-5 py-3" @submit.prevent="buscar">
            <div class="relative flex-1">
              <Search class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" :size="16" />
              <input
                v-model="termo"
                type="search"
                placeholder="Ex.: banana prata, picanha, alface"
                class="h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] pl-10 pr-3 text-white outline-none transition focus:border-red-600"
              >
            </div>
            <button
              type="submit"
              :disabled="carregando || !termo.trim()"
              class="h-11 rounded-xl border border-[#2a2a2a] px-4 text-sm font-semibold text-[#ccc] transition hover:border-red-600 hover:text-white disabled:opacity-40"
            >
              Buscar
            </button>
          </form>

          <div class="flex-1 overflow-y-auto px-5 pb-4">
            <div v-if="carregando" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div v-for="n in 6" :key="n" class="aspect-square animate-pulse rounded-xl bg-[#1d1d1d]" />
            </div>

            <div v-else-if="erro" class="flex flex-col items-center px-4 py-12 text-center">
              <ImageOff :size="34" class="text-[#555]" />
              <p class="mt-3 max-w-md text-sm text-[#bbb]">
                {{ erro }}
              </p>
            </div>

            <p v-else-if="!fotos.length" class="py-12 text-center text-sm text-[#666]">
              Nenhuma foto encontrada — tente outro termo (às vezes funciona melhor mais simples, tipo "picanha" em vez do nome inteiro).
            </p>

            <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div v-for="f in fotos" :key="f.id" class="flex flex-col gap-1">
                <button
                  type="button"
                  class="relative aspect-square overflow-hidden rounded-xl bg-[#1d1d1d] ring-2 transition"
                  :class="selecionada?.id === f.id ? 'ring-red-600' : 'ring-transparent hover:ring-[#444]'"
                  :aria-pressed="selecionada?.id === f.id"
                  @click="selecionada = f"
                >
                  <img :src="f.miniatura" :alt="f.alt" loading="lazy" class="h-full w-full object-cover">
                  <span v-if="selecionada?.id === f.id" class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white shadow">
                    <Check :size="16" />
                  </span>
                </button>
                <a :href="f.autorUrl || f.pagina" target="_blank" rel="noopener noreferrer" class="truncate text-[11px] text-[#666] hover:text-[#aaa]">
                  Foto: {{ f.autor || 'Pexels' }}
                </a>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 border-t border-[#222] px-5 py-3">
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" class="text-xs text-[#666] hover:text-[#aaa]">
              Fotos do Pexels · uso comercial gratuito
            </a>
            <button
              type="button"
              :disabled="!selecionada || salvando"
              class="flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
              @click="usar"
            >
              <LoaderCircle v-if="salvando" :size="16" class="animate-spin" />
              {{ salvando ? 'Salvando...' : 'Usar esta foto' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
