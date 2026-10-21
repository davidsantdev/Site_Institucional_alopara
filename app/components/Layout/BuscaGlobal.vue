<script setup lang="ts">
/**
 * Busca do site inteiro, no header. Sugere produtos enquanto a pessoa digita
 * (lê o catálogo em memória do nosso servidor via /api/geral — nunca a CISS
 * direto) e Enter leva pra página de resultados completa (/busca?q=...).
 */
import type { Produto } from '~/composables/useCatalogo'
import { onClickOutside } from '@vueuse/core'
import { ArrowRight, Clock, LoaderCircle, Search, TrendingUp, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import Preco from '~/components/Layout/Preco.vue'
import { linkProduto } from '~/composables/useCatalogo'
import { formatarNome, formatarTipo } from '~/composables/useFormatacao'

const props = withDefaults(defineProps<{ id?: string }>(), { id: 'busca' })

const MIN_CARACTERES = 2
const MAX_SUGESTOES = 6
const DEBOUNCE_MS = 220
const MAX_RECENTES = 5
const CHAVE_RECENTES = 'alopara-buscas-recentes'
const POPULARES = ['Arroz', 'Feijão', 'Café', 'Leite', 'Frango', 'Óleo', 'Açúcar', 'Cerveja']

const route = useRoute()
const raiz = ref<HTMLElement | null>(null)
const campo = ref<HTMLInputElement | null>(null)

const termo = ref('')
const aberto = ref(false)
const carregando = ref(false)
const sugestoes = ref<Produto[]>([])
const total = ref(0)
const destaque = ref(-1)
const recentes = ref<string[]>([])

const termoLimpo = computed(() => termo.value.trim())
const buscando = computed(() => termoLimpo.value.length >= MIN_CARACTERES)
const idLista = `${props.id}-sugestoes`

// ═════════════ SUGESTÕES ═════════════

let timer: ReturnType<typeof setTimeout> | null = null
let controller: AbortController | null = null
let sequencia = 0

async function buscar(t: string) {
  controller?.abort()
  controller = new AbortController()
  const minha = ++sequencia
  try {
    const r = await $fetch<{ produtos: Produto[], total: number }>('/api/geral', {
      query: { busca: t, pagina: 1 },
      signal: controller.signal,
    })
    if (minha !== sequencia)
      return
    sugestoes.value = r.produtos.slice(0, MAX_SUGESTOES)
    total.value = r.total
  }
  catch (e: any) {
    if (e?.name === 'AbortError' || minha !== sequencia)
      return
    sugestoes.value = []
    total.value = 0
  }
  finally {
    if (minha === sequencia)
      carregando.value = false
  }
}

watch(termoLimpo, (t) => {
  destaque.value = -1
  if (timer)
    clearTimeout(timer)
  if (t.length < MIN_CARACTERES) {
    controller?.abort()
    sequencia++
    carregando.value = false
    sugestoes.value = []
    total.value = 0
    return
  }
  carregando.value = true
  timer = setTimeout(buscar, DEBOUNCE_MS, t)
})

// ═════════════ BUSCAS RECENTES ═════════════

function lerRecentes() {
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_RECENTES) ?? '[]')
    recentes.value = Array.isArray(salvas) ? salvas.slice(0, MAX_RECENTES) : []
  }
  catch {
    recentes.value = []
  }
}

function salvarRecente(t: string) {
  if (!t)
    return
  const lista = [t, ...recentes.value.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENTES)
  recentes.value = lista
  try {
    localStorage.setItem(CHAVE_RECENTES, JSON.stringify(lista))
  }
  catch {
    // Sem storage: as recentes valem só nesta visita.
  }
}

function limparRecentes() {
  recentes.value = []
  try {
    localStorage.removeItem(CHAVE_RECENTES)
  }
  catch {}
}

// ═════════════ NAVEGAÇÃO ═════════════

function fechar() {
  aberto.value = false
  destaque.value = -1
}

function irParaResultados(t = termoLimpo.value) {
  if (!t)
    return
  termo.value = t
  salvarRecente(t)
  fechar()
  campo.value?.blur()
  navigateTo({ path: '/busca', query: { q: t } })
}

function irParaProduto(produto: Produto) {
  salvarRecente(termoLimpo.value)
  fechar()
  campo.value?.blur()
  termo.value = ''
  navigateTo(linkProduto(produto))
}

function mover(passo: 1 | -1) {
  aberto.value = true
  if (!buscando.value || !sugestoes.value.length)
    return
  // Índice `sugestoes.length` = a linha "ver todos os resultados".
  const opcoes = sugestoes.value.length + 1
  destaque.value = (destaque.value + passo + opcoes) % opcoes
}

function aoEnter(e: KeyboardEvent) {
  const escolhido = sugestoes.value[destaque.value]
  if (aberto.value && escolhido) {
    e.preventDefault()
    irParaProduto(escolhido)
  }
}

function limpar() {
  termo.value = ''
  campo.value?.focus()
}

onClickOutside(raiz, fechar)

// Chegou em /busca?q=... (link, voltar do navegador): o campo mostra o termo.
watch(() => route.fullPath, () => {
  fechar()
  termo.value = route.path.toLowerCase() === '/busca' && typeof route.query.q === 'string' ? route.query.q : ''
}, { immediate: true })

onMounted(lerRecentes)
</script>

<template>
  <div ref="raiz" class="relative">
    <form role="search" class="relative" @submit.prevent="irParaResultados()">
      <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--texto-suave)" :size="18" />
      <input
        :id="id"
        ref="campo"
        v-model="termo"
        type="search"
        role="combobox"
        autocomplete="off"
        enterkeyhint="search"
        aria-label="Buscar produtos no Alô Pará"
        aria-autocomplete="list"
        :aria-expanded="aberto"
        :aria-controls="idLista"
        :aria-activedescendant="destaque >= 0 ? `${id}-opcao-${destaque}` : undefined"
        placeholder="Buscar arroz, café, frango..."
        class="h-11 w-full rounded-full border border-(--borda-forte) bg-(--bg-cartao) pl-11 pr-11 text-[15px] text-(--texto-primario) shadow-(--sombra-1) outline-none transition placeholder:text-(--texto-suave) hover:border-(--borda-hover) focus:border-red-600 focus:ring-4 focus:ring-red-600/12 [&::-webkit-search-cancel-button]:hidden"
        @focus="aberto = true"
        @keydown.down.prevent="mover(1)"
        @keydown.up.prevent="mover(-1)"
        @keydown.enter="aoEnter"
        @keydown.esc="fechar(); campo?.blur()"
      >
      <button
        v-if="termo"
        type="button"
        aria-label="Limpar busca"
        class="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-(--texto-suave) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
        @click="limpar"
      >
        <X :size="16" />
      </button>
    </form>

    <Transition name="painel">
      <div
        v-if="aberto"
        class="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain rounded-2xl border border-(--borda) bg-(--bg-cartao) shadow-(--sombra-3)"
      >
        <!-- Digitando: sugestões de produto -->
        <template v-if="buscando">
          <div v-if="carregando && !sugestoes.length" class="flex items-center gap-2 px-4 py-5 text-sm text-(--texto-fraco)">
            <LoaderCircle class="animate-spin" :size="16" />
            Buscando "{{ termoLimpo }}"...
          </div>

          <div v-else-if="!sugestoes.length" class="px-4 py-5">
            <p class="text-sm font-semibold text-(--texto-primario)">
              Nada encontrado para "{{ termoLimpo }}"
            </p>
            <p class="mt-1 text-sm text-(--texto-fraco)">
              Confira a ortografia ou tente um termo mais geral, como "arroz" ou "sabão".
            </p>
          </div>

          <ul v-else :id="idLista" role="listbox" :aria-label="`Sugestões para ${termoLimpo}`" class="py-1.5" :class="{ 'opacity-60 transition-opacity': carregando }">
            <li
              v-for="(p, i) in sugestoes"
              :id="`${id}-opcao-${i}`"
              :key="p.id"
              role="option"
              :aria-selected="destaque === i"
            >
              <button
                type="button"
                tabindex="-1"
                class="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors"
                :class="destaque === i ? 'bg-(--bg-elevado)' : 'hover:bg-(--bg-elevado)'"
                @mouseenter="destaque = i"
                @click="irParaProduto(p)"
              >
                <span class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-(--bg-foto)">
                  <FotoProduto :produto="p" img-class="h-10 w-10 object-contain" emoji-class="text-2xl" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="line-clamp-1 text-sm font-medium text-(--texto-primario)">{{ formatarNome(p.nome) }}</span>
                  <span class="line-clamp-1 text-xs text-(--texto-fraco)">{{ formatarTipo(p.tipo) }}</span>
                </span>
                <Preco :valor="p.preco2" :por-kg="p.pesavel" class="shrink-0 text-lg" />
              </button>
            </li>
          </ul>

          <button
            v-if="sugestoes.length"
            :id="`${id}-opcao-${sugestoes.length}`"
            type="button"
            tabindex="-1"
            class="flex w-full items-center justify-between gap-3 border-t border-(--borda) px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors"
            :class="destaque === sugestoes.length ? 'bg-(--bg-elevado)' : 'hover:bg-(--bg-elevado)'"
            @mouseenter="destaque = sugestoes.length"
            @click="irParaResultados()"
          >
            <span>
              Ver {{ total > sugestoes.length ? `todos os ${total.toLocaleString('pt-BR')} resultados` : 'resultados' }}
              para "{{ termoLimpo }}"
            </span>
            <ArrowRight :size="16" class="shrink-0" />
          </button>
        </template>

        <!-- Campo vazio: recentes + mais buscados -->
        <div v-else class="p-4">
          <template v-if="recentes.length">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-(--texto-fraco)">
                Buscas recentes
              </p>
              <button type="button" class="text-xs font-medium text-(--texto-fraco) transition hover:text-red-600" @click="limparRecentes">
                Limpar
              </button>
            </div>
            <div class="mb-4 flex flex-wrap gap-2">
              <button
                v-for="r in recentes"
                :key="r"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border border-(--borda-forte) px-3 py-1.5 text-sm text-(--texto-secundario) transition hover:border-red-600 hover:text-red-600"
                @click="irParaResultados(r)"
              >
                <Clock :size="13" class="opacity-60" />
                {{ r }}
              </button>
            </div>
          </template>

          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-(--texto-fraco)">
            Mais buscados
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in POPULARES"
              :key="p"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full bg-(--bg-elevado) px-3 py-1.5 text-sm text-(--texto-secundario) transition hover:bg-red-600 hover:text-white"
              @click="irParaResultados(p)"
            >
              <TrendingUp :size="13" class="opacity-60" />
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.painel-enter-active, .painel-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.painel-enter-from, .painel-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
