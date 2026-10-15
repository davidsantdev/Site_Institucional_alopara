<script setup lang="ts">
/**
 * Lista as respostas da pesquisa interna de satisfação (ver
 * app/pages/pesquisa-satisfacao.vue e server/utils/pesquisaSatisfacao.ts).
 * Mesma sessão de cookie do /admin — se chegar aqui sem estar logado, manda
 * pra lá em vez de duplicar o formulário de login.
 */
import { ChevronDown, Download, LogOut } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { listarPerguntas } from '~/composables/usePesquisaSatisfacao'

useSeoMeta({
  title: 'Pesquisa de satisfação | Alô Pará',
  robots: 'noindex, nofollow',
})

interface RespostaPesquisa {
  id: string
  criadoEm: number
  nome?: string
  setor: string
  tempoEmpresa?: string
  data: string
  respostas: Record<string, string>
}

const tela = ref<'carregando' | 'painel'>('carregando')
const respostasPesquisa = ref<RespostaPesquisa[]>([])
const carregando = ref(false)
const expandido = ref<string | null>(null)

async function verificarSessao() {
  try {
    const r = await $fetch<{ autenticado: boolean }>('/api/admin/sessao')
    if (!r.autenticado) {
      await navigateTo('/admin')
      return
    }
    tela.value = 'painel'
    carregarRespostas()
  }
  catch {
    await navigateTo('/admin')
  }
}

async function carregarRespostas() {
  carregando.value = true
  try {
    const r = await $fetch<{ respostas: RespostaPesquisa[] }>('/api/admin/pesquisa-satisfacao')
    respostasPesquisa.value = r.respostas
  }
  catch {
    toast.error('Erro ao carregar as respostas')
  }
  finally {
    carregando.value = false
  }
}

async function sair() {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  await navigateTo('/admin')
}

function alternarExpandido(id: string) {
  expandido.value = expandido.value === id ? null : id
}

function formatarData(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR')
}

function escaparCSV(valor: string): string {
  const v = valor.replace(/"/g, '""')
  return /[",\n]/.test(v) ? `"${v}"` : v
}

function baixarCSV() {
  const perguntas = listarPerguntas()
  const detalhes = perguntas.filter(p => p.detalhe).map(p => p.detalhe!)

  const cabecalho = [
    'Enviado em',
    'Nome',
    'Setor',
    'Tempo de empresa',
    'Data',
    ...perguntas.map(p => p.texto),
    ...detalhes.map(d => d.label),
  ]

  const linhas = respostasPesquisa.value.map((r) => {
    const colunas = [
      formatarData(r.criadoEm),
      r.nome ?? '',
      r.setor,
      r.tempoEmpresa ?? '',
      r.data,
      ...perguntas.map(p => r.respostas[p.id] ?? ''),
      ...detalhes.map(d => r.respostas[d.id] ?? ''),
    ]
    return colunas.map(escaparCSV).join(',')
  })

  const csv = [cabecalho.map(escaparCSV).join(','), ...linhas].join('\n')
  // BOM no início — sem isso o Excel lê acento errado em UTF-8.
  const bom = String.fromCharCode(0xFEFF)
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pesquisa-satisfacao-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(verificarSessao)
</script>

<template>
  <div class="min-h-screen bg-[#111111] font-sans text-white">
    <div v-if="tela === 'carregando'" class="flex min-h-screen items-center justify-center text-[#555]">
      Carregando...
    </div>

    <div v-else class="mx-auto max-w-4xl px-4 py-8">
      <div class="mb-8 flex items-center justify-between gap-4">
        <div>
          <NuxtLink to="/admin" class="text-xs font-semibold text-[#666] hover:text-white transition-colors">
            ← Voltar ao painel
          </NuxtLink>
          <h1 class="text-xl font-black mt-1">
            Pesquisa de satisfação
          </h1>
          <p class="text-sm text-[#666]">
            {{ respostasPesquisa.length }} resposta(s) recebida(s)
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="!respostasPesquisa.length"
            class="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#888] transition hover:border-emerald-600 hover:text-white disabled:opacity-40"
            @click="baixarCSV"
          >
            <Download :size="14" /> Baixar CSV
          </button>
          <button
            class="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#888] transition hover:border-red-600 hover:text-white"
            @click="sair"
          >
            <LogOut :size="14" /> Sair
          </button>
        </div>
      </div>

      <p v-if="carregando" class="text-sm text-[#555]">
        Carregando respostas...
      </p>

      <p v-else-if="!respostasPesquisa.length" class="text-sm text-[#555]">
        Ainda não chegou nenhuma resposta.
      </p>

      <div v-else class="flex flex-col gap-3">
        <div
          v-for="r in respostasPesquisa"
          :key="r.id"
          class="rounded-xl border border-[#1f1f1f] bg-[#161616] overflow-hidden"
        >
          <!-- resumo (clicável) -->
          <button
            type="button"
            class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            @click="alternarExpandido(r.id)"
          >
            <div class="flex items-center gap-4 flex-wrap min-w-0">
              <span class="text-sm font-bold text-white">{{ r.nome || 'Anônimo' }}</span>
              <span class="text-xs text-[#666]">{{ r.setor }}</span>
              <span v-if="r.tempoEmpresa" class="text-xs text-[#555]">{{ r.tempoEmpresa }}</span>
              <span class="text-xs text-[#555]">{{ formatarData(r.criadoEm) }}</span>
            </div>
            <ChevronDown
              :size="16"
              class="shrink-0 text-[#555] transition-transform"
              :class="{ 'rotate-180': expandido === r.id }"
            />
          </button>

          <!-- respostas completas -->
          <div v-if="expandido === r.id" class="border-t border-[#1f1f1f] px-5 py-5 flex flex-col gap-5">
            <div v-for="pergunta in listarPerguntas()" :key="pergunta.id" class="flex flex-col gap-1">
              <p class="text-[13px] font-semibold text-[#999]">
                {{ pergunta.texto }}
              </p>
              <p class="text-[14px] text-white">
                {{ r.respostas[pergunta.id] || '—' }}
              </p>
              <p v-if="pergunta.detalhe && r.respostas[pergunta.detalhe.id]" class="text-[13px] text-[#888] pl-3 border-l border-[#2a2a2a]">
                {{ pergunta.detalhe.label }} {{ r.respostas[pergunta.detalhe.id] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
