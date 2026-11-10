<script setup lang="ts">
/**
 * Assistente de compras: o cliente escreve "quero uma ceia de natal com 50
 * reais" e a IA (server/utils/assistente) busca no catálogo e devolve o que
 * colocar no carrinho — aplicado aqui na hora, sem a pessoa tocar em nada.
 * Cada resposta mostra os itens em cartões, com "Desfazer" e "Ver carrinho".
 *
 * Só aparece quando a IA está configurada no servidor (/api/assistente/status).
 */
import type { Produto } from '~/composables/useCatalogo'
import { onKeyStroke } from '@vueuse/core'
import { ArrowUp, RotateCcw, ShoppingCart, Undo2, X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import rostoAtendente from '~/assets/img/web/atendente-rosto.webp'
import fotoAtendente from '~/assets/img/web/atendente.webp'
import FotoProduto from '~/components/Layout/FotoProduto.vue'
import { linkProduto } from '~/composables/useCatalogo'
import { formatarNome, formatarReais } from '~/composables/useFormatacao'
import { precoUnitario, rotuloQuantidade, subtotalItem, useCarrinho } from '~/data/composable/UseCarrinho'

interface ItemAdicionado {
  produto: Produto
  quantidade: number
  removido?: boolean
}

interface Mensagem {
  id: number
  papel: 'cliente' | 'assistente'
  texto: string
  itens?: ItemAdicionado[]
  removidos?: string[]
  desfeito?: boolean
  erro?: boolean
}

const SUGESTOES = [
  'Monta uma ceia de Natal com R$ 50',
  'Tem refrigerante de até R$ 5?',
  'Hoje é domingo: feijoada pra 6 pessoas',
  'Café da manhã com R$ 30',
]

const ESTADOS_CARREGANDO = ['Procurando no mercado…', 'Conferindo as ofertas…', 'Montando seu carrinho…', 'Fazendo as contas…']

const CHAVE_SESSAO = 'alopara-assistente'

const route = useRoute()
const { carrinho, adicionarCarrinho } = useCarrinho()

const ativo = ref(false)
const aberto = ref(false)
const mensagens = ref<Mensagem[]>([])
const texto = ref('')
const enviando = ref(false)
const estadoCarregando = ref(0)
const lista = ref<HTMLElement | null>(null)
const campo = ref<HTMLTextAreaElement | null>(null)
let proximoId = 1
let timerEstado: ReturnType<typeof setInterval> | undefined

// Páginas onde o botão atrapalha (checkout, painel) ou não faz sentido.
const escondido = computed(() => /^\/(?:admin|carrinho|pesquisa-satisfacao)/i.test(route.path))
// Na página de produto o celular tem a barra de comprar fixa embaixo: o botão sobe.
const acimaDaBarra = computed(() => route.path.startsWith('/produto/'))

function salvarSessao() {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(mensagens.value.slice(-30)))
  }
  catch {
    // Sem storage (modo privado): a conversa só não sobrevive ao recarregar.
  }
}

onMounted(async () => {
  try {
    const salvas = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) ?? '[]')
    if (Array.isArray(salvas)) {
      mensagens.value = salvas
      proximoId = Math.max(0, ...salvas.map((m: Mensagem) => m.id)) + 1
    }
  }
  catch {
    // Conversa salva corrompida ou storage bloqueado: começa do zero.
  }
  try {
    ativo.value = (await $fetch<{ ativo: boolean }>('/api/assistente/status')).ativo
  }
  catch {
    ativo.value = false
  }
})

onBeforeUnmount(() => clearInterval(timerEstado))

watch(mensagens, salvarSessao, { deep: true })

async function rolarProFim() {
  await nextTick()
  lista.value?.scrollTo({ top: lista.value.scrollHeight, behavior: 'smooth' })
}

function abrir() {
  aberto.value = true
  rolarProFim()
  nextTick(() => campo.value?.focus())
}

// Celular: o painel ocupa a tela toda, então trava a rolagem da página por trás.
watch(aberto, (v) => {
  if (import.meta.client && window.matchMedia('(max-width: 639px)').matches)
    document.documentElement.style.overflow = v ? 'hidden' : ''
})

// Foi pra uma página onde o assistente some (ex.: carrinho): fecha, senão a rolagem ficaria travada.
watch(escondido, (v) => {
  if (v)
    aberto.value = false
})

onKeyStroke('Escape', () => {
  if (aberto.value)
    aberto.value = false
})

/** O que a IA precisa lembrar de cada resposta anterior: o texto + o que ela pôs no carrinho. */
function textoParaHistorico(m: Mensagem): string {
  const itens = (m.itens ?? []).filter(i => !i.removido && !m.desfeito)
  if (!itens.length)
    return m.texto
  return `${m.texto}\n(Itens que adicionei: ${itens.map(i => `${i.produto.nome} — ${rotuloQuantidade({ quantidade: i.quantidade, pesavel: i.produto.pesavel })}`).join('; ')})`
}

/** Tira do carrinho só a quantidade que o assistente pôs (se a pessoa já tinha 1, continua com 1). */
function subtrair(produto: Produto, quantidade: number) {
  const item = carrinho.value.find((p: any) => p.nome === produto.nome)
  if (!item)
    return
  const nova = produto.pesavel ? Math.round((item.quantidade - quantidade) * 1000) / 1000 : item.quantidade - quantidade
  if (nova <= 0.0001)
    carrinho.value = carrinho.value.filter((p: any) => p.nome !== produto.nome)
  else
    item.quantidade = nova
}

function desfazer(m: Mensagem) {
  for (const i of m.itens ?? []) {
    if (!i.removido)
      subtrair(i.produto, i.quantidade)
  }
  m.desfeito = true
}

function tirarItem(i: ItemAdicionado) {
  subtrair(i.produto, i.quantidade)
  i.removido = true
}

function totalDe(m: Mensagem): number {
  return (m.itens ?? [])
    .filter(i => !i.removido)
    .reduce((acc, i) => acc + Math.round(subtotalItem({ ...i.produto, quantidade: i.quantidade }) * 100), 0) / 100
}

async function enviar(conteudo = texto.value) {
  const t = conteudo.trim().slice(0, 500)
  if (!t || enviando.value)
    return
  texto.value = ''
  mensagens.value.push({ id: proximoId++, papel: 'cliente', texto: t })
  enviando.value = true
  estadoCarregando.value = 0
  timerEstado = setInterval(() => {
    estadoCarregando.value = (estadoCarregando.value + 1) % ESTADOS_CARREGANDO.length
  }, 2600)
  rolarProFim()

  try {
    const r = await $fetch<{ mensagem: string, adicionar: ItemAdicionado[], remover: string[], erro?: boolean }>('/api/assistente', {
      method: 'POST',
      body: {
        historico: mensagens.value
          .filter(m => !m.erro)
          .slice(-12)
          .map(m => ({ papel: m.papel, texto: m.papel === 'assistente' ? textoParaHistorico(m) : m.texto })),
        carrinho: carrinho.value.map((i: any) => ({
          nome: i.nome,
          quantidade: i.quantidade ?? 1,
          preco: precoUnitario(i),
          pesavel: Boolean(i.pesavel),
        })),
      },
    })

    for (const nome of r.remover ?? [])
      carrinho.value = carrinho.value.filter((p: any) => p.nome !== nome)
    for (const { produto, quantidade } of r.adicionar ?? [])
      adicionarCarrinho(produto, quantidade, { silencioso: true })

    mensagens.value.push({
      id: proximoId++,
      papel: 'assistente',
      texto: r.mensagem,
      itens: r.adicionar?.length ? r.adicionar.map(a => ({ produto: a.produto, quantidade: a.quantidade })) : undefined,
      removidos: r.remover?.length ? r.remover : undefined,
      erro: r.erro,
    })
  }
  catch {
    mensagens.value.push({
      id: proximoId++,
      papel: 'assistente',
      texto: 'Não consegui me conectar agora. Confere sua internet e tenta de novo?',
      erro: true,
    })
  }
  finally {
    enviando.value = false
    clearInterval(timerEstado)
    rolarProFim()
    nextTick(() => campo.value?.focus())
  }
}

function novaConversa() {
  mensagens.value = []
  nextTick(() => campo.value?.focus())
}

function teclaEnter(e: KeyboardEvent) {
  if (e.shiftKey || e.isComposing)
    return
  e.preventDefault()
  enviar()
}
</script>

<template>
  <div v-if="ativo && !escondido">
    <!-- Botão flutuante -->
    <Transition name="botao">
      <button
        v-if="!aberto"
        type="button"
        class="fixed right-4 z-50 flex h-15 items-center gap-2.5 rounded-full bg-red-600 py-1.5 pl-1.5 pr-5 font-semibold text-white shadow-[0_12px_32px_-8px_rgb(220_38_38/0.6)] transition hover:bg-red-700 active:scale-95 md:bottom-6 md:right-6"
        :class="acimaDaBarra ? 'bottom-24' : 'bottom-5'"
        aria-label="Falar com a Atendente do Alô"
        @click="abrir"
      >
        <span class="relative shrink-0">
          <img :src="rostoAtendente" alt="" width="48" height="48" class="h-12 w-12 rounded-full object-cover ring-2 ring-white/90">
          <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-red-600 bg-green-400" />
        </span>
        <span class="flex flex-col items-start leading-tight">
          <span class="text-[15px]">Monte sua compra</span>
          <span class="text-[11px] font-medium text-white/80">Fale com a Atendente</span>
        </span>
      </button>
    </Transition>

    <!-- Painel -->
    <Transition name="painel">
      <section
        v-if="aberto"
        role="dialog"
        aria-label="Atendente do Alô — assistente de compras"
        class="fixed inset-0 z-60 flex flex-col bg-(--bg-pagina) sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-105 sm:overflow-hidden sm:rounded-3xl sm:border sm:border-(--borda) sm:shadow-(--sombra-3)"
      >
        <!-- Cabeçalho -->
        <header class="flex items-center gap-3 border-b border-(--borda) bg-(--bg-cartao) px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <span class="relative shrink-0">
            <img :src="rostoAtendente" alt="" width="44" height="44" class="h-11 w-11 rounded-full object-cover ring-2 ring-red-600/20">
            <span class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-(--bg-cartao) bg-green-500" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[15px] font-bold leading-tight text-(--texto-primario)">
              Atendente do Alô
            </p>
            <p class="truncate text-xs text-(--texto-esmaecido)">
              <span class="font-medium text-green-600">Online agora</span>
            </p>
          </div>
          <button
            v-if="mensagens.length"
            type="button"
            title="Nova conversa"
            class="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-(--texto-esmaecido) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
            @click="novaConversa"
          >
            <RotateCcw :size="16" />
            <span class="sr-only sm:not-sr-only">Nova conversa</span>
          </button>
          <button
            type="button"
            aria-label="Fechar assistente"
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-(--texto-esmaecido) transition hover:bg-(--bg-elevado) hover:text-(--texto-primario)"
            @click="aberto = false"
          >
            <X :size="20" />
          </button>
        </header>

        <!-- Conversa -->
        <div ref="lista" class="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
          <!-- Boas-vindas -->
          <div v-if="!mensagens.length" class="flex flex-col items-center px-2 pt-4 text-center">
            <img :src="fotoAtendente" alt="Atendente do Alô" width="112" height="112" class="h-28 w-28 rounded-full object-cover shadow-(--sombra-2) ring-4 ring-red-600/15">
            <h2 class="mt-4 text-xl font-bold text-(--texto-primario)">
              Oi! Eu sou a Atendente do Alô
            </h2>
            <p class="mt-1.5 max-w-xs text-sm leading-relaxed text-(--texto-esmaecido)">
              Me diga a ocasião e quanto quer gastar: eu procuro as ofertas e já coloco tudo no seu carrinho.
            </p>
            <div class="mt-6 flex w-full flex-col gap-2">
              <button
                v-for="s in SUGESTOES"
                :key="s"
                type="button"
                class="rounded-2xl border border-(--borda) bg-(--bg-cartao) px-4 py-3 text-left text-sm font-medium text-(--texto-secundario) transition hover:border-red-600/50 hover:text-(--texto-primario) active:scale-[0.99]"
                @click="enviar(s)"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <template v-for="m in mensagens" :key="m.id">
            <!-- Cliente -->
            <div v-if="m.papel === 'cliente'" class="flex justify-end">
              <p class="max-w-[85%] whitespace-pre-line rounded-3xl rounded-br-lg bg-red-600 px-4 py-2.5 text-[14.5px] leading-snug text-white">
                {{ m.texto }}
              </p>
            </div>

            <!-- Atendente -->
            <div v-else class="flex gap-2">
              <img :src="rostoAtendente" alt="" width="32" height="32" class="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover">
              <div class="flex min-w-0 flex-1 flex-col gap-2">
                <p
                  class="max-w-[94%] self-start whitespace-pre-line rounded-3xl rounded-tl-lg border px-4 py-2.5 text-[14.5px] leading-snug"
                  :class="m.erro ? 'border-amber-500/40 bg-amber-500/10 text-(--texto-secundario)' : 'border-(--borda) bg-(--bg-cartao) text-(--texto-secundario)'"
                >
                  {{ m.texto }}
                </p>

                <p v-if="m.removidos?.length" class="px-1 text-xs text-(--texto-esmaecido)">
                  Tirei do carrinho: {{ m.removidos.map(formatarNome).join(', ') }}
                </p>

                <!-- Itens que entraram no carrinho -->
                <div v-if="m.itens?.length" class="overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao)" :class="m.desfeito && 'opacity-50'">
                  <ul class="divide-y divide-(--borda)">
                    <li v-for="i in m.itens" :key="i.produto.id" class="flex items-center gap-3 px-3 py-2.5" :class="i.removido && 'opacity-40'">
                      <NuxtLink :to="linkProduto(i.produto)" class="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-(--bg-foto)">
                        <FotoProduto :produto="i.produto" img-class="h-[85%] w-[85%] object-contain" emoji-class="text-3xl" />
                      </NuxtLink>
                      <div class="min-w-0 flex-1">
                        <p class="line-clamp-2 text-[13px] font-medium leading-tight text-(--texto-primario)" :class="i.removido && 'line-through'">
                          {{ formatarNome(i.produto.nome) }}
                        </p>
                        <p class="numeros mt-0.5 text-xs text-(--texto-esmaecido)">
                          {{ rotuloQuantidade({ quantidade: i.quantidade, pesavel: i.produto.pesavel }) }}
                          <template v-if="i.produto.pesavel">
                            · R$ {{ formatarReais(precoUnitario(i.produto)) }}/kg
                          </template>
                          <span v-if="i.produto.emPromocao" class="ml-1 rounded bg-red-600 px-1 py-px text-[10px] font-bold text-white">OFERTA</span>
                        </p>
                      </div>
                      <p class="numeros shrink-0 text-sm font-bold text-(--preco)">
                        R$ {{ formatarReais(subtotalItem({ ...i.produto, quantidade: i.quantidade })) }}
                      </p>
                      <button
                        v-if="!i.removido && !m.desfeito"
                        type="button"
                        :aria-label="`Tirar ${formatarNome(i.produto.nome)} do carrinho`"
                        class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-(--texto-fraco) transition hover:bg-(--bg-elevado) hover:text-red-600"
                        @click="tirarItem(i)"
                      >
                        <X :size="15" />
                      </button>
                    </li>
                  </ul>
                  <div class="flex items-center justify-between gap-2 border-t border-(--borda) bg-(--bg-elevado) px-3 py-2.5">
                    <p class="text-xs text-(--texto-esmaecido)">
                      <template v-if="m.desfeito">
                        Desfeito — saiu do carrinho
                      </template>
                      <template v-else>
                        Adicionado: <span class="numeros whitespace-nowrap font-bold text-(--texto-primario)">R$ {{ formatarReais(totalDe(m)) }}</span>
                      </template>
                    </p>
                    <div v-if="!m.desfeito" class="flex items-center gap-1.5">
                      <button
                        type="button"
                        class="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-(--texto-esmaecido) transition hover:bg-(--bg-cartao) hover:text-(--texto-primario)"
                        @click="desfazer(m)"
                      >
                        <Undo2 :size="14" />
                        Desfazer
                      </button>
                      <NuxtLink
                        to="/Carrinho"
                        class="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700"
                        @click="aberto = false"
                      >
                        <ShoppingCart :size="14" />
                        Ver carrinho
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Pensando -->
          <div v-if="enviando" class="flex items-center gap-2.5">
            <img :src="rostoAtendente" alt="" width="32" height="32" class="h-8 w-8 shrink-0 rounded-full object-cover">
            <span class="flex gap-1">
              <span class="ponto h-2 w-2 rounded-full bg-red-600" />
              <span class="ponto h-2 w-2 rounded-full bg-red-600 [animation-delay:150ms]" />
              <span class="ponto h-2 w-2 rounded-full bg-red-600 [animation-delay:300ms]" />
            </span>
            <span class="text-sm text-(--texto-esmaecido)">{{ ESTADOS_CARREGANDO[estadoCarregando] }}</span>
          </div>
        </div>

        <!-- Campo de mensagem -->
        <form class="border-t border-(--borda) bg-(--bg-cartao) px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3" @submit.prevent="enviar()">
          <div class="flex items-end gap-2 rounded-3xl border border-(--borda-forte) bg-(--bg-input) py-1.5 pl-4 pr-1.5 transition focus-within:border-red-600">
            <textarea
              ref="campo"
              v-model="texto"
              rows="1"
              maxlength="500"
              placeholder="Ex.: churrasco pra 10 pessoas"
              aria-label="Mensagem para o assistente"
              class="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base text-(--texto-primario) outline-none field-sizing-content placeholder:text-(--texto-fraco)"
              @keydown.enter="teclaEnter"
            />
            <button
              type="submit"
              :disabled="!texto.trim() || enviando"
              aria-label="Enviar"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red-600 text-white transition hover:bg-red-700 disabled:bg-(--bg-elevado) disabled:text-(--texto-fraco)"
            >
              <ArrowUp :size="18" />
            </button>
          </div>
          <p class="mt-2 text-center text-[11px] text-(--texto-fraco)">
            Assistente com IA: confira os itens antes de finalizar.
          </p>
        </form>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.ponto { animation: pulo 1s ease-in-out infinite; }
@keyframes pulo {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40% { transform: translateY(-4px); opacity: 1; }
}

.botao-enter-active, .botao-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.botao-enter-from, .botao-leave-to { opacity: 0; transform: scale(0.85); }

.painel-enter-active, .painel-leave-active { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1); }
.painel-enter-from, .painel-leave-to { opacity: 0; transform: translateY(16px) scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .ponto, .botao-enter-active, .botao-leave-active, .painel-enter-active, .painel-leave-active { animation: none; transition: none; }
}
</style>
