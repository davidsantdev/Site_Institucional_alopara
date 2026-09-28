<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  ImageOff,
  Link2,
  LogOut,
  Newspaper,
  Package,
  PackageX,
  PencilLine,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Users,
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { imagemErro, imgSrc } from '~/composables/useCatalogo'

// Página de uso interno — nunca deve ser indexada nem seguida pelo Google.
useSeoMeta({
  title: 'Painel | Alô Pará',
  robots: 'noindex, nofollow',
})

type Tela = 'carregando' | 'login' | 'painel'
const tela = ref<Tela>('carregando')

// ═════════════ LOGIN ═════════════

const senha = ref('')
const erroLogin = ref('')
const entrando = ref(false)

async function verificarSessao() {
  try {
    const r = await $fetch<{ autenticado: boolean }>('/api/admin/sessao')
    tela.value = r.autenticado ? 'painel' : 'login'
    if (r.autenticado) {
      carregarStats()
      carregarEncartes()
      carregarAfiliados()
    }
  }
  catch {
    tela.value = 'login'
  }
}

async function entrar() {
  erroLogin.value = ''
  entrando.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { senha: senha.value } })
    senha.value = ''
    tela.value = 'painel'
    carregarStats()
    carregarEncartes()
    carregarAfiliados()
  }
  catch (e: any) {
    erroLogin.value = e?.data?.statusMessage || 'Não foi possível entrar'
  }
  finally {
    entrando.value = false
  }
}

async function sair() {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  tela.value = 'login'
}

// ═════════════ ATUALIZAR CATÁLOGO AGORA ═════════════
// TTL automático é 6h — este botão é o "sai na hora" pra quando o admin sabe
// que algo mudou na CISS (promoção acabou, preço mudou) e não quer esperar.

const atualizando = ref(false)

async function atualizarAgora() {
  atualizando.value = true
  try {
    const r = await $fetch<{ jaEmAndamento: boolean }>('/api/admin/atualizar', { method: 'POST' })
    toast.success(
      r.jaEmAndamento ? 'Já tinha uma atualização em andamento' : 'Atualização iniciada',
      { description: 'Pode levar alguns minutos (revalida imagens de novo) — os números aqui atualizam sozinhos.' },
    )
    // Uma olhada rápida agora (ainda em andamento) e outra mais tarde (bem
    // provável que já tenha terminado) — sem virar polling permanente.
    setTimeout(carregarStats, 15_000)
    setTimeout(carregarStats, 90_000)
  }
  catch {
    toast.error('Erro ao iniciar atualização')
  }
  finally {
    atualizando.value = false
  }
}

// ═════════════ ESTATÍSTICAS (dashboard) ═════════════

interface Estatisticas {
  total: number
  semImagem: number
  semEstoque: number
  emPromocao: number
  ocultos: number
  overridesManuais: number
  porCategoria: Record<'alimentos' | 'bebidas' | 'limpeza' | 'perfumaria', number>
  catalogo: { atualizadoEm: number, completo: boolean, idadeMin: number }
  cosmos: { habilitado: boolean, usadosHoje: number, limiteDiario: number }
}

const stats = ref<Estatisticas | null>(null)
const carregandoStats = ref(false)

const LABEL_CATEGORIA: Record<string, string> = {
  alimentos: 'Alimentos',
  bebidas: 'Bebidas',
  limpeza: 'Limpeza',
  perfumaria: 'Perfumaria',
}

async function carregarStats() {
  carregandoStats.value = true
  try {
    stats.value = await $fetch<Estatisticas>('/api/admin/estatisticas')
  }
  catch {
    toast.error('Erro ao carregar estatísticas')
  }
  finally {
    carregandoStats.value = false
  }
}

function formatarNumero(n: number) {
  return n.toLocaleString('pt-BR')
}

function formatarIdade(min: number) {
  if (min < 0)
    return 'nunca'
  if (min < 60)
    return `${min}min atrás`
  const horas = Math.floor(min / 60)
  if (horas < 24)
    return `${horas}h atrás`
  return `${Math.floor(horas / 24)}d atrás`
}

const percentualSemImagem = computed(() => {
  if (!stats.value || stats.value.total === 0)
    return 0
  return Math.round((stats.value.semImagem / stats.value.total) * 100)
})

// ═════════════ BUSCA / FILTROS RÁPIDOS ═════════════

interface ProdutoAdmin {
  id: string
  nome: string
  preco2: string
  precoOriginal: string
  emPromocao: boolean
  tipo: string
  img: string
  imagemReal: boolean
  semEstoque: boolean
  estoqueManual: boolean
  oculto: boolean
}

type Filtro = '' | 'sem-imagem' | 'ocultos' | 'sem-estoque' | 'em-promocao'

const busca = ref('')
const filtro = ref<Filtro>('')
const produtos = ref<ProdutoAdmin[]>([])
const buscando = ref(false)
const paginaAtual = ref(1)
const totalPaginas = ref(1)
const totalResultados = ref(0)
let timeoutBusca: ReturnType<typeof setTimeout> | null = null

async function executarBusca(pagina = 1) {
  if (!busca.value.trim() && !filtro.value) {
    produtos.value = []
    totalResultados.value = 0
    totalPaginas.value = 1
    return
  }
  buscando.value = true
  try {
    const r = await $fetch<{ produtos: ProdutoAdmin[], total: number, pagina: number, totalPaginas: number }>('/api/admin/produtos', {
      query: { busca: busca.value, filtro: filtro.value || undefined, pagina },
    })
    produtos.value = r.produtos
    totalResultados.value = r.total
    totalPaginas.value = r.totalPaginas
    paginaAtual.value = r.pagina
  }
  catch {
    toast.error('Erro ao buscar produtos')
  }
  finally {
    buscando.value = false
  }
}

function aoDigitarBusca() {
  if (timeoutBusca)
    clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(() => {
    filtro.value = '' // digitar texto sai do modo "filtro rápido"
    executarBusca(1)
  }, 400)
}

function alternarFiltro(novo: Filtro) {
  filtro.value = filtro.value === novo ? '' : novo
  busca.value = ''
  executarBusca(1)
}

function irParaPagina(p: number) {
  if (p < 1 || p > totalPaginas.value || buscando.value)
    return
  executarBusca(p)
}

const modoAtivo = computed(() => busca.value.trim() ? 'busca' : filtro.value || null)

// ═════════════ IMAGEM POR PRODUTO ═════════════

const enviando = ref<Record<string, boolean>>({})

async function enviarImagem(produto: ProdutoAdmin, arquivo: File) {
  enviando.value[produto.id] = true
  try {
    const form = new FormData()
    form.append('imagem', arquivo)
    const r = await $fetch<{ imagem: string }>(`/api/admin/produtos/${produto.id}/imagem`, {
      method: 'POST',
      body: form,
    })
    produto.img = r.imagem
    produto.imagemReal = true
    toast.success('Imagem atualizada', { description: produto.nome })
    carregarStats()
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao enviar imagem')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

function aoEscolherArquivo(produto: ProdutoAdmin, evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivo = input.files?.[0]
  if (arquivo)
    enviarImagem(produto, arquivo)
  input.value = '' // permite escolher o mesmo arquivo de novo depois, se precisar
}

async function removerImagem(produto: ProdutoAdmin) {
  enviando.value[produto.id] = true
  try {
    await $fetch(`/api/admin/produtos/${produto.id}/imagem`, { method: 'DELETE' })
    toast.success('Imagem removida — voltou ao automático', { description: produto.nome })
    await executarBusca(paginaAtual.value) // recarrega pra refletir a imagem automática atual
    carregarStats()
  }
  catch {
    toast.error('Erro ao remover imagem')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

// ═════════════ REMOVER/RESTAURAR PRODUTO DO SITE ═════════════

async function alternarOculto(produto: ProdutoAdmin) {
  enviando.value[produto.id] = true
  try {
    const metodo = produto.oculto ? 'DELETE' : 'POST'
    await $fetch(`/api/admin/produtos/${produto.id}/ocultar`, { method: metodo })
    produto.oculto = !produto.oculto
    toast.success(produto.oculto ? 'Removido do site' : 'Produto restaurado', { description: produto.nome })
    // No modo "ocultos" o produto some da lista assim que é restaurado — recarrega a página atual.
    if (filtro.value === 'ocultos')
      await executarBusca(paginaAtual.value)
    carregarStats()
  }
  catch {
    toast.error('Erro ao atualizar o produto')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

// ═════════════ CORRIGIR ESTOQUE NA MÃO ═════════════
// Pra quando a CISS erra (ex.: "arroz" sem o campo de estoque preenchido,
// mas com estoque de verdade na loja) — corrige um produto sem esperar a
// CISS mandar o dado certo algum dia.

async function corrigirEstoque(produto: ProdutoAdmin, disponivel: boolean) {
  enviando.value[produto.id] = true
  try {
    await $fetch(`/api/admin/produtos/${produto.id}/estoque`, { method: 'POST', body: { disponivel } })
    produto.semEstoque = !disponivel
    produto.estoqueManual = true
    toast.success(disponivel ? 'Marcado como disponível' : 'Marcado como sem estoque', { description: produto.nome })
    carregarStats()
  }
  catch {
    toast.error('Erro ao corrigir estoque')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

async function removerCorrecaoEstoque(produto: ProdutoAdmin) {
  enviando.value[produto.id] = true
  try {
    await $fetch(`/api/admin/produtos/${produto.id}/estoque`, { method: 'DELETE' })
    produto.estoqueManual = false
    toast.success('Correção removida — voltou a valer o automático', { description: produto.nome })
    // No modo "sem estoque" o produto pode sumir/aparecer na lista dependendo
    // do que a CISS disser de verdade — recarrega pra refletir.
    if (filtro.value === 'sem-estoque')
      await executarBusca(paginaAtual.value)
    carregarStats()
  }
  catch {
    toast.error('Erro ao remover correção')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

// ═════════════ ENCARTES ═════════════
// Conteúdo puro que o admin sobe na mão — sem depender de CISS/Mercafácil.

interface EncarteAdmin {
  id: string
  titulo: string
  arquivo: string
  criadoEm: number
}

const encartes = ref<EncarteAdmin[]>([])
const carregandoEncartes = ref(false)
const novoTituloEncarte = ref('')
const enviandoEncarte = ref(false)
const removendoEncarte = ref<Record<string, boolean>>({})

async function carregarEncartes() {
  carregandoEncartes.value = true
  try {
    const r = await $fetch<{ encartes: EncarteAdmin[] }>('/api/encartes')
    encartes.value = r.encartes
  }
  catch {
    toast.error('Erro ao carregar encartes')
  }
  finally {
    carregandoEncartes.value = false
  }
}

/**
 * Encolhe a imagem no navegador antes de subir — o nginx do servidor tem um
 * limite padrão de 1MB por requisição, e fotos de encarte tiradas de celular
 * fácil passam de 5-10MB. Em vez de depender de mexer na config do servidor
 * (frágil, fácil de errar), a imagem já sai pequena o suficiente pra nunca
 * esbarrar nesse limite, não importa a config do servidor.
 */
async function comprimirImagem(arquivo: File): Promise<File> {
  const ALVO_BYTES = 700 * 1024 // bem abaixo do limite padrão de 1MB do nginx
  const MAX_DIMENSAO = 1800

  if (arquivo.size <= ALVO_BYTES)
    return arquivo

  try {
    const bitmap = await createImageBitmap(arquivo)
    let largura = bitmap.width
    let altura = bitmap.height
    if (largura > MAX_DIMENSAO || altura > MAX_DIMENSAO) {
      const escala = MAX_DIMENSAO / Math.max(largura, altura)
      largura = Math.round(largura * escala)
      altura = Math.round(altura * escala)
    }

    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return arquivo
    ctx.drawImage(bitmap, 0, 0, largura, altura)

    // Vai reduzindo a qualidade até caber no alvo, sem passar de 5 tentativas.
    let qualidade = 0.85
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', qualidade))
      if (!blob)
        break
      if (blob.size <= ALVO_BYTES || qualidade <= 0.4)
        return new File([blob], `${arquivo.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' })
      qualidade -= 0.15
    }
  }
  catch {
    // Se o navegador não conseguir comprimir por algum motivo, manda o arquivo
    // original mesmo — melhor tentar (e talvez esbarrar no limite) do que travar aqui.
  }
  return arquivo
}

async function aoEscolherArquivoEncarte(evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivoOriginal = input.files?.[0]
  if (!arquivoOriginal)
    return

  enviandoEncarte.value = true
  try {
    const arquivo = await comprimirImagem(arquivoOriginal)
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('titulo', novoTituloEncarte.value)
    const r = await $fetch<{ encarte: EncarteAdmin }>('/api/admin/encartes', { method: 'POST', body: form })
    encartes.value.unshift(r.encarte)
    novoTituloEncarte.value = ''
    toast.success('Encarte adicionado')
  }
  catch (e: any) {
    // Sem statusMessage normalmente é o nginx/proxy recusando o corpo da
    // requisição antes de chegar no Nitro (ex.: 413 por client_max_body_size
    // baixo) — mostrar o código ajuda a identificar isso sem olhar log de servidor.
    const status = e?.status ?? e?.statusCode
    toast.error(e?.data?.statusMessage || (status ? `Erro ao enviar encarte (código ${status})` : 'Erro ao enviar encarte — verifique a conexão'))
  }
  finally {
    enviandoEncarte.value = false
    input.value = '' // permite escolher o mesmo arquivo de novo depois, se precisar
  }
}

async function removerEncarteAdmin(encarte: EncarteAdmin) {
  removendoEncarte.value[encarte.id] = true
  try {
    await $fetch(`/api/admin/encartes/${encarte.id}`, { method: 'DELETE' })
    encartes.value = encartes.value.filter(e => e.id !== encarte.id)
    toast.success('Encarte removido', { description: encarte.titulo })
  }
  catch {
    toast.error('Erro ao remover encarte')
  }
  finally {
    removendoEncarte.value[encarte.id] = false
  }
}

// ═════════════ AFILIADOS (Indique e Ganhe) ═════════════
// Como o pedido fecha pelo WhatsApp (sem pagamento no site), não tem como
// confirmar uma venda sozinho — o admin registra na mão quando o atendente
// vê o código de indicação chegar na mensagem.

interface Afiliado {
  id: string
  nome: string
  codigo: string
  percentual: number
  telefone?: string
  criadoEm: number
}

interface Indicacao {
  id: string
  afiliadoId: string
  codigo: string
  valorCompra: number
  comissao: number
  observacao?: string
  status: 'pendente' | 'pago'
  criadoEm: number
  pagoEm?: number
}

const afiliados = ref<Afiliado[]>([])
const indicacoes = ref<Indicacao[]>([])
const carregandoAfiliados = ref(false)

const novoNomeAfiliado = ref('')
const novoCodigoAfiliado = ref('')
const novoPercentualAfiliado = ref<number | null>(null)
const novoTelefoneAfiliado = ref('')
const criandoAfiliado = ref(false)
const removendoAfiliado = ref<Record<string, boolean>>({})

const codigoIndicacao = ref('')
const valorIndicacao = ref<number | null>(null)
const observacaoIndicacao = ref('')
const registrandoIndicacao = ref(false)
const alternandoIndicacao = ref<Record<string, boolean>>({})
const removendoIndicacao = ref<Record<string, boolean>>({})

async function carregarAfiliados() {
  carregandoAfiliados.value = true
  try {
    const [rA, rI] = await Promise.all([
      $fetch<{ afiliados: Afiliado[] }>('/api/admin/afiliados'),
      $fetch<{ indicacoes: Indicacao[] }>('/api/admin/indicacoes'),
    ])
    afiliados.value = rA.afiliados
    indicacoes.value = rI.indicacoes
  }
  catch {
    toast.error('Erro ao carregar afiliados')
  }
  finally {
    carregandoAfiliados.value = false
  }
}

/** Sugere um código a partir do nome — só se o admin ainda não tiver editado o campo na mão. */
function aoDigitarNomeAfiliado() {
  if (novoCodigoAfiliado.value)
    return
  novoCodigoAfiliado.value = novoNomeAfiliado.value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)[0]
    ?.slice(0, 10) ?? ''
}

async function criarAfiliadoAdmin() {
  criandoAfiliado.value = true
  try {
    const r = await $fetch<{ afiliado: Afiliado }>('/api/admin/afiliados', {
      method: 'POST',
      body: {
        nome: novoNomeAfiliado.value,
        codigo: novoCodigoAfiliado.value,
        percentual: novoPercentualAfiliado.value,
        telefone: novoTelefoneAfiliado.value || undefined,
      },
    })
    afiliados.value.unshift(r.afiliado)
    novoNomeAfiliado.value = ''
    novoCodigoAfiliado.value = ''
    novoPercentualAfiliado.value = null
    novoTelefoneAfiliado.value = ''
    toast.success('Afiliado cadastrado')
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao cadastrar afiliado')
  }
  finally {
    criandoAfiliado.value = false
  }
}

async function removerAfiliadoAdmin(afiliado: Afiliado) {
  removendoAfiliado.value[afiliado.id] = true
  try {
    await $fetch(`/api/admin/afiliados/${afiliado.id}`, { method: 'DELETE' })
    afiliados.value = afiliados.value.filter(a => a.id !== afiliado.id)
    toast.success('Afiliado removido', { description: afiliado.nome })
  }
  catch {
    toast.error('Erro ao remover afiliado')
  }
  finally {
    removendoAfiliado.value[afiliado.id] = false
  }
}

function linkAfiliado(codigo: string) {
  return `https://alopara.com.br/?ref=${codigo}`
}

async function copiarLinkAfiliado(codigo: string) {
  try {
    await navigator.clipboard.writeText(linkAfiliado(codigo))
    toast.success('Link copiado')
  }
  catch {
    toast.error(`Não foi possível copiar — copie na mão: ${linkAfiliado(codigo)}`)
  }
}

async function registrarIndicacaoAdmin() {
  if (!codigoIndicacao.value || !valorIndicacao.value) {
    toast.error('Escolha o afiliado e o valor da compra')
    return
  }
  registrandoIndicacao.value = true
  try {
    const r = await $fetch<{ indicacao: Indicacao }>('/api/admin/indicacoes', {
      method: 'POST',
      body: {
        codigo: codigoIndicacao.value,
        valorCompra: valorIndicacao.value,
        observacao: observacaoIndicacao.value || undefined,
      },
    })
    indicacoes.value.unshift(r.indicacao)
    codigoIndicacao.value = ''
    valorIndicacao.value = null
    observacaoIndicacao.value = ''
    toast.success('Venda registrada', { description: `Comissão: R$ ${r.indicacao.comissao.toFixed(2)}` })
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao registrar venda')
  }
  finally {
    registrandoIndicacao.value = false
  }
}

async function alternarIndicacaoAdmin(indicacao: Indicacao) {
  alternandoIndicacao.value[indicacao.id] = true
  try {
    const r = await $fetch<{ indicacao: Indicacao }>(`/api/admin/indicacoes/${indicacao.id}`, { method: 'PATCH' })
    const idx = indicacoes.value.findIndex(i => i.id === indicacao.id)
    if (idx !== -1)
      indicacoes.value[idx] = r.indicacao
  }
  catch {
    toast.error('Erro ao atualizar status')
  }
  finally {
    alternandoIndicacao.value[indicacao.id] = false
  }
}

async function removerIndicacaoAdmin(indicacao: Indicacao) {
  removendoIndicacao.value[indicacao.id] = true
  try {
    await $fetch(`/api/admin/indicacoes/${indicacao.id}`, { method: 'DELETE' })
    indicacoes.value = indicacoes.value.filter(i => i.id !== indicacao.id)
    toast.success('Indicação removida')
  }
  catch {
    toast.error('Erro ao remover indicação')
  }
  finally {
    removendoIndicacao.value[indicacao.id] = false
  }
}

/** Soma de comissão pendente/paga por afiliado, pra mostrar no card sem recalcular a cada render. */
const resumoAfiliados = computed(() => {
  const mapa = new Map<string, { pendente: number, pago: number }>()
  for (const i of indicacoes.value) {
    const atual = mapa.get(i.afiliadoId) ?? { pendente: 0, pago: 0 }
    if (i.status === 'pendente')
      atual.pendente += i.comissao
    else
      atual.pago += i.comissao
    mapa.set(i.afiliadoId, atual)
  }
  return mapa
})

onMounted(verificarSessao)
</script>

<template>
  <div class="min-h-screen bg-[#111111] font-sans text-white">
    <!-- carregando -->
    <div v-if="tela === 'carregando'" class="flex min-h-screen items-center justify-center text-[#555]">
      Carregando...
    </div>

    <!-- login -->
    <div v-else-if="tela === 'login'" class="flex min-h-screen items-center justify-center px-4">
      <form class="w-full max-w-sm rounded-2xl border border-[#1f1f1f] bg-[#161616] p-8" @submit.prevent="entrar">
        <h1 class="mb-1 text-xl font-black">
          <span class="text-red-600">Alô</span> Pará — Admin
        </h1>
        <p class="mb-6 text-sm text-[#666]">
          Painel de edição de produtos
        </p>

        <label for="senha" class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#888]">Senha</label>
        <input
          id="senha"
          v-model="senha"
          type="password"
          autofocus
          class="mb-4 h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 text-white outline-none transition focus:border-red-600"
          placeholder="••••••••"
        >

        <p v-if="erroLogin" class="mb-4 text-sm text-red-500">
          {{ erroLogin }}
        </p>

        <button
          type="submit"
          :disabled="entrando || !senha"
          class="flex h-12 w-full items-center justify-center rounded-xl bg-red-600 font-bold transition hover:bg-red-700 disabled:opacity-40"
        >
          {{ entrando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>

    <!-- painel -->
    <div v-else class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black">
            <span class="text-red-600">Alô</span> Pará — Admin
          </h1>
          <p class="text-sm text-[#666]">
            Dashboard do catálogo
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            :disabled="atualizando"
            title="Dispara uma varredura nova agora, sem esperar o TTL de 6h"
            class="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#888] transition hover:border-emerald-600 hover:text-white disabled:opacity-40"
            @click="atualizarAgora"
          >
            <RefreshCw :size="14" :class="{ 'animate-spin': atualizando }" />
            {{ atualizando ? 'Atualizando...' : 'Atualizar agora' }}
          </button>
          <button
            class="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#888] transition hover:border-red-600 hover:text-white"
            @click="sair"
          >
            <LogOut :size="14" /> Sair
          </button>
        </div>
      </div>

      <!-- ═══ STATS ═══ -->
      <p v-if="carregandoStats && !stats" class="mb-6 text-sm text-[#555]">
        Carregando estatísticas...
      </p>

      <div v-else-if="stats" class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
        <!-- total -->
        <div class="rounded-xl border border-[#1f1f1f] bg-[#161616] p-4">
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <Package :size="13" /> Produtos
          </div>
          <p class="text-2xl font-black text-white">
            {{ formatarNumero(stats.total) }}
          </p>
        </div>

        <!-- sem imagem (clicável) -->
        <button
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="filtro === 'sem-imagem' ? 'border-amber-500 bg-amber-500/10' : 'border-[#1f1f1f] bg-[#161616] hover:border-amber-500/60'"
          @click="alternarFiltro('sem-imagem')"
        >
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <ImageOff :size="13" /> Sem imagem
          </div>
          <p class="text-2xl font-black text-amber-400">
            {{ formatarNumero(stats.semImagem) }}
            <span class="text-xs font-bold text-[#555]">({{ percentualSemImagem }}%)</span>
          </p>
        </button>

        <!-- sem estoque (clicável — inclui quem tem saldo ≤0 na CISS E quem nem informa o campo) -->
        <button
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="filtro === 'sem-estoque' ? 'border-orange-500 bg-orange-500/10' : 'border-[#1f1f1f] bg-[#161616] hover:border-orange-500/60'"
          title="Escondidos do site público: saldo de estoque ≤0 na CISS, ou o campo nem veio preenchido."
          @click="alternarFiltro('sem-estoque')"
        >
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <PackageX :size="13" /> Sem estoque
          </div>
          <p class="text-2xl font-black text-orange-400">
            {{ formatarNumero(stats.semEstoque) }}
          </p>
        </button>

        <!-- em promoção (clicável) -->
        <button
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="filtro === 'em-promocao' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[#1f1f1f] bg-[#161616] hover:border-emerald-500/60'"
          @click="alternarFiltro('em-promocao')"
        >
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <Tag :size="13" /> Em promoção
          </div>
          <p class="text-2xl font-black text-emerald-400">
            {{ formatarNumero(stats.emPromocao) }}
          </p>
        </button>

        <!-- ocultos (clicável) -->
        <button
          type="button"
          class="rounded-xl border p-4 text-left transition"
          :class="filtro === 'ocultos' ? 'border-red-600 bg-red-600/10' : 'border-[#1f1f1f] bg-[#161616] hover:border-red-600/60'"
          @click="alternarFiltro('ocultos')"
        >
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <EyeOff :size="13" /> Ocultos
          </div>
          <p class="text-2xl font-black text-red-400">
            {{ formatarNumero(stats.ocultos) }}
          </p>
        </button>

        <!-- fotos manuais -->
        <div class="rounded-xl border border-[#1f1f1f] bg-[#161616] p-4">
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <PencilLine :size="13" /> Fotos manuais
          </div>
          <p class="text-2xl font-black text-white">
            {{ formatarNumero(stats.overridesManuais) }}
          </p>
        </div>

        <!-- catálogo -->
        <div class="rounded-xl border border-[#1f1f1f] bg-[#161616] p-4" :title="stats.catalogo.atualizadoEm ? new Date(stats.catalogo.atualizadoEm).toLocaleString('pt-BR') : ''">
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <Clock :size="13" /> Catálogo
          </div>
          <p class="text-sm font-black leading-tight" :class="stats.catalogo.completo ? 'text-white' : 'text-amber-400'">
            {{ stats.catalogo.completo ? formatarIdade(stats.catalogo.idadeMin) : 'Construindo...' }}
          </p>
        </div>

        <!-- cosmos -->
        <div class="rounded-xl border border-[#1f1f1f] bg-[#161616] p-4">
          <div class="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            <Sparkles :size="13" /> Cosmos hoje
          </div>
          <p class="text-sm font-black leading-tight text-white">
            {{ stats.cosmos.habilitado ? `${stats.cosmos.usadosHoje}/${stats.cosmos.limiteDiario}` : 'Desativado' }}
          </p>
        </div>
      </div>

      <!-- categorias -->
      <div v-if="stats" class="mb-8 flex flex-wrap gap-4 px-1 text-xs text-[#666]">
        <span v-for="(total, cat) in stats.porCategoria" :key="cat">
          <span class="font-semibold text-[#999]">{{ LABEL_CATEGORIA[cat] }}</span>
          · {{ formatarNumero(total) }}
        </span>
      </div>

      <!-- ═══ BUSCA ═══ -->
      <div class="relative mb-4">
        <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" :size="18" />
        <input
          v-model="busca"
          type="search"
          placeholder="Buscar produto por nome..."
          class="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#161616] pl-12 pr-4 text-white outline-none transition focus:border-red-600"
          @input="aoDigitarBusca"
        >
      </div>

      <div v-if="modoAtivo" class="mb-4 flex items-center justify-between text-xs text-[#666]">
        <span>
          <span class="font-bold text-[#ccc]">{{ formatarNumero(totalResultados) }}</span>
          {{ totalResultados === 1 ? 'produto encontrado' : 'produtos encontrados' }}
        </span>
        <span v-if="totalPaginas > 1">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
      </div>

      <p v-if="buscando" class="text-sm text-[#555]">
        Buscando...
      </p>
      <p v-else-if="modoAtivo && produtos.length === 0" class="text-sm text-[#555]">
        Nenhum produto encontrado.
      </p>

      <div class="flex flex-col gap-2">
        <div
          v-for="p in produtos"
          :key="p.id"
          class="flex items-center gap-4 rounded-xl border border-[#1f1f1f] bg-[#161616] p-3 transition-opacity"
          :class="{ 'opacity-50': p.oculto }"
        >
          <img
            :src="imgSrc(p.img)"
            :alt="p.nome"
            class="h-16 w-16 shrink-0 rounded-lg bg-white object-contain p-1"
            @error="imagemErro"
          >

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-semibold">
                {{ p.nome }}
              </p>
              <span
                v-if="!p.imagemReal"
                class="shrink-0 rounded-full border border-amber-800 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-400"
              >
                Sem imagem
              </span>
              <span
                v-if="p.semEstoque"
                class="shrink-0 rounded-full border border-orange-800 bg-orange-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-400"
              >
                Sem estoque
              </span>
              <span
                v-if="p.estoqueManual"
                title="Estoque corrigido na mão — não é o que a CISS informou"
                class="shrink-0 rounded-full border border-sky-800 bg-sky-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-400"
              >
                Estoque manual
              </span>
              <span
                v-if="p.emPromocao"
                class="shrink-0 rounded-full border border-emerald-800 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400"
              >
                Promoção
              </span>
              <span
                v-if="p.oculto"
                class="shrink-0 rounded-full border border-red-900 bg-red-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-400"
              >
                Removido do site
              </span>
            </div>
            <p class="text-xs text-[#666]">
              {{ p.tipo }} ·
              <template v-if="p.emPromocao">
                Preço normal: <span class="line-through">R$ {{ p.precoOriginal }}</span> ·
                Preço do clube: <span class="font-semibold text-emerald-400">R$ {{ p.preco2 }}</span>
              </template>
              <template v-else>
                R$ {{ p.preco2 }}
              </template>
            </p>
          </div>

          <label
            class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs font-semibold text-[#ccc] transition hover:border-red-600 hover:text-white"
            :class="{ 'pointer-events-none opacity-40': enviando[p.id] }"
          >
            <Upload :size="14" />
            {{ enviando[p.id] ? 'Enviando...' : 'Trocar foto' }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="aoEscolherArquivo(p, $event)"
            >
          </label>

          <button
            title="Remover foto escolhida (volta ao automático)"
            class="shrink-0 rounded-lg border border-[#2a2a2a] p-2 text-[#555] transition hover:border-red-600 hover:text-red-500 disabled:opacity-40"
            :disabled="enviando[p.id]"
            @click="removerImagem(p)"
          >
            <Trash2 :size="14" />
          </button>

          <button
            v-if="p.estoqueManual"
            title="Remover correção manual — volta a valer o que a CISS informar"
            class="shrink-0 rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs font-semibold text-sky-400 transition hover:border-sky-600 disabled:opacity-40"
            :disabled="enviando[p.id]"
            @click="removerCorrecaoEstoque(p)"
          >
            Automático
          </button>
          <button
            v-else
            :title="p.semEstoque ? 'Corrigir: marcar como disponível' : 'Corrigir: marcar como sem estoque'"
            class="shrink-0 rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs font-semibold text-[#ccc] transition hover:border-sky-600 hover:text-sky-400 disabled:opacity-40"
            :disabled="enviando[p.id]"
            @click="corrigirEstoque(p, p.semEstoque)"
          >
            {{ p.semEstoque ? 'Marcar disponível' : 'Marcar sem estoque' }}
          </button>

          <button
            :title="p.oculto ? 'Restaurar produto no site' : 'Remover produto do site'"
            class="shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-40"
            :class="p.oculto
              ? 'border-[#2a2a2a] text-[#ccc] hover:border-emerald-600 hover:text-emerald-400'
              : 'border-[#2a2a2a] text-[#ccc] hover:border-red-600 hover:text-red-500'"
            :disabled="enviando[p.id]"
            @click="alternarOculto(p)"
          >
            <span class="flex items-center gap-1.5">
              <component :is="p.oculto ? Eye : EyeOff" :size="14" />
              {{ p.oculto ? 'Restaurar' : 'Remover' }}
            </span>
          </button>
        </div>
      </div>

      <!-- paginação -->
      <div v-if="totalPaginas > 1" class="mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a2a] text-[#888] transition hover:border-red-600 hover:text-white disabled:opacity-30"
          :disabled="paginaAtual <= 1 || buscando"
          @click="irParaPagina(paginaAtual - 1)"
        >
          <ChevronLeft :size="16" />
        </button>
        <span class="px-2 text-sm text-[#888]">{{ paginaAtual }} / {{ totalPaginas }}</span>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a2a] text-[#888] transition hover:border-red-600 hover:text-white disabled:opacity-30"
          :disabled="paginaAtual >= totalPaginas || buscando"
          @click="irParaPagina(paginaAtual + 1)"
        >
          <ChevronRight :size="16" />
        </button>
      </div>

      <!-- ═══ ENCARTES ═══ -->
      <div class="mt-10 border-t border-[#1f1f1f] pt-8">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-black">
          <Newspaper :size="18" class="text-red-600" /> Encartes
        </h2>

        <!-- upload -->
        <div class="mb-6 flex flex-col gap-3 rounded-xl border border-[#1f1f1f] bg-[#161616] p-4 sm:flex-row sm:items-center">
          <input
            v-model="novoTituloEncarte"
            type="text"
            placeholder="Título (ex.: Ofertas de 08 a 14/09)"
            class="h-11 flex-1 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
          >
          <label
            class="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#2a2a2a] px-4 text-sm font-semibold text-[#ccc] transition hover:border-red-600 hover:text-white"
            :class="{ 'pointer-events-none opacity-40': enviandoEncarte }"
          >
            <Upload :size="14" />
            {{ enviandoEncarte ? 'Enviando...' : 'Escolher imagem e adicionar' }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="aoEscolherArquivoEncarte"
            >
          </label>
        </div>

        <p v-if="carregandoEncartes" class="text-sm text-[#555]">
          Carregando encartes...
        </p>
        <p v-else-if="encartes.length === 0" class="text-sm text-[#555]">
          Nenhum encarte publicado ainda.
        </p>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <div
            v-for="e in encartes"
            :key="e.id"
            class="overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#161616]"
          >
            <img :src="`/uploads/encartes/${e.arquivo}`" :alt="e.titulo" class="aspect-3/4 w-full object-cover">
            <div class="p-2">
              <p class="truncate text-xs font-semibold">
                {{ e.titulo }}
              </p>
              <p class="text-[10px] text-[#555]">
                {{ new Date(e.criadoEm).toLocaleDateString('pt-BR') }}
              </p>
              <button
                type="button"
                class="mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg border border-[#2a2a2a] py-1.5 text-[11px] font-semibold text-[#888] transition hover:border-red-600 hover:text-red-500 disabled:opacity-40"
                :disabled="removendoEncarte[e.id]"
                @click="removerEncarteAdmin(e)"
              >
                <Trash2 :size="12" /> {{ removendoEncarte[e.id] ? 'Removendo...' : 'Remover' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ AFILIADOS (Indique e Ganhe) ═══ -->
      <div class="mt-10 border-t border-[#1f1f1f] pt-8">
        <h2 class="mb-4 flex items-center gap-2 text-lg font-black">
          <Users :size="18" class="text-red-600" /> Indique e Ganhe
        </h2>

        <!-- cadastrar afiliado -->
        <div class="mb-6 rounded-xl border border-[#1f1f1f] bg-[#161616] p-4">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#666]">
            Novo afiliado
          </p>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              v-model="novoNomeAfiliado"
              type="text"
              placeholder="Nome"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
              @input="aoDigitarNomeAfiliado"
            >
            <input
              v-model="novoCodigoAfiliado"
              type="text"
              placeholder="Código (ex.: JOAO10)"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white uppercase outline-none transition focus:border-red-600"
            >
            <input
              v-model.number="novoPercentualAfiliado"
              type="number"
              min="0.1"
              max="100"
              step="0.5"
              placeholder="% de comissão"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
            >
            <input
              v-model="novoTelefoneAfiliado"
              type="text"
              placeholder="Telefone (opcional)"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
            >
          </div>
          <button
            type="button"
            class="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
            :disabled="criandoAfiliado || !novoNomeAfiliado || !novoCodigoAfiliado || !novoPercentualAfiliado"
            @click="criarAfiliadoAdmin"
          >
            {{ criandoAfiliado ? 'Cadastrando...' : 'Cadastrar afiliado' }}
          </button>
        </div>

        <!-- lista de afiliados -->
        <p v-if="carregandoAfiliados" class="text-sm text-[#555]">
          Carregando...
        </p>
        <p v-else-if="afiliados.length === 0" class="text-sm text-[#555]">
          Nenhum afiliado cadastrado ainda.
        </p>

        <div v-else class="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="a in afiliados"
            :key="a.id"
            class="rounded-xl border border-[#1f1f1f] bg-[#161616] p-4"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate font-bold text-white">
                  {{ a.nome }}
                </p>
                <p class="text-xs text-[#888]">
                  <span class="font-mono text-red-500">{{ a.codigo }}</span> · {{ a.percentual }}%
                </p>
                <p v-if="a.telefone" class="text-xs text-[#666]">
                  {{ a.telefone }}
                </p>
              </div>
              <button
                title="Remover afiliado"
                class="shrink-0 rounded-lg border border-[#2a2a2a] p-2 text-[#555] transition hover:border-red-600 hover:text-red-500 disabled:opacity-40"
                :disabled="removendoAfiliado[a.id]"
                @click="removerAfiliadoAdmin(a)"
              >
                <Trash2 :size="14" />
              </button>
            </div>

            <div class="mt-3 flex items-center justify-between border-t border-[#1f1f1f] pt-3 text-xs">
              <span class="text-emerald-400">Pendente: R$ {{ (resumoAfiliados.get(a.id)?.pendente ?? 0).toFixed(2) }}</span>
              <span class="text-[#666]">Pago: R$ {{ (resumoAfiliados.get(a.id)?.pago ?? 0).toFixed(2) }}</span>
            </div>

            <button
              type="button"
              class="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#2a2a2a] py-1.5 text-[11px] font-semibold text-[#888] transition hover:border-red-600 hover:text-white"
              @click="copiarLinkAfiliado(a.codigo)"
            >
              <Link2 :size="12" /> Copiar link de indicação
            </button>
          </div>
        </div>

        <!-- registrar venda indicada -->
        <div class="mb-6 rounded-xl border border-[#1f1f1f] bg-[#161616] p-4">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#666]">
            Registrar venda indicada
          </p>
          <div class="grid gap-3 sm:grid-cols-3">
            <select
              v-model="codigoIndicacao"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
            >
              <option value="" disabled>
                Escolha o afiliado
              </option>
              <option v-for="a in afiliados" :key="a.id" :value="a.codigo">
                {{ a.nome }} ({{ a.codigo }})
              </option>
            </select>
            <input
              v-model.number="valorIndicacao"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Valor da compra (R$)"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
            >
            <input
              v-model="observacaoIndicacao"
              type="text"
              placeholder="Observação (opcional)"
              class="h-11 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white outline-none transition focus:border-red-600"
            >
          </div>
          <button
            type="button"
            class="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
            :disabled="registrandoIndicacao || !codigoIndicacao || !valorIndicacao"
            @click="registrarIndicacaoAdmin"
          >
            {{ registrandoIndicacao ? 'Registrando...' : 'Registrar venda' }}
          </button>
        </div>

        <!-- lista de indicações -->
        <p v-if="indicacoes.length === 0" class="text-sm text-[#555]">
          Nenhuma venda indicada registrada ainda.
        </p>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="i in indicacoes"
            :key="i.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f1f1f] bg-[#161616] p-3"
          >
            <div class="text-sm">
              <span class="font-mono text-red-500">{{ i.codigo }}</span>
              <span class="text-[#888]"> · compra R$ {{ i.valorCompra.toFixed(2) }} · comissão </span>
              <span class="font-bold text-white">R$ {{ i.comissao.toFixed(2) }}</span>
              <span v-if="i.observacao" class="text-[#666]"> · {{ i.observacao }}</span>
              <p class="text-[10px] text-[#555]">
                {{ new Date(i.criadoEm).toLocaleDateString('pt-BR') }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40"
                :class="i.status === 'pago'
                  ? 'border-emerald-700 text-emerald-400'
                  : 'border-[#2a2a2a] text-[#ccc] hover:border-emerald-600 hover:text-emerald-400'"
                :disabled="alternandoIndicacao[i.id]"
                @click="alternarIndicacaoAdmin(i)"
              >
                {{ i.status === 'pago' ? 'Pago ✓' : 'Marcar como pago' }}
              </button>
              <button
                title="Remover"
                class="rounded-lg border border-[#2a2a2a] p-2 text-[#555] transition hover:border-red-600 hover:text-red-500 disabled:opacity-40"
                :disabled="removendoIndicacao[i.id]"
                @click="removerIndicacaoAdmin(i)"
              >
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
