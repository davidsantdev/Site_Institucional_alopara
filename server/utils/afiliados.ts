/**
 * Programa "Indique e Ganhe" — afiliados cadastrados na mão pelo admin (sem
 * auto-cadastro público, pra não virar bagunça/fraude numa cidade pequena).
 * Cada afiliado tem um código único e compartilha um link
 * (alopara.com.br/?ref=CODIGO). Como o site não processa pagamento — o
 * pedido fecha no WhatsApp — não tem como confirmar uma venda sozinho: o
 * admin registra a venda na mão aqui quando o atendente vê o código chegar.
 */
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

export interface Afiliado {
  id: string
  nome: string
  /** Sempre maiúsculo/alfanumérico — é o que vai na URL e na mensagem do WhatsApp. */
  codigo: string
  /** Ex.: 3 = 3% do valor de cada compra indicada. */
  percentual: number
  telefone?: string
  criadoEm: number
}

export interface Indicacao {
  id: string
  afiliadoId: string
  /** Guardado junto pra não sumir da lista se o afiliado for removido depois. */
  codigo: string
  valorCompra: number
  comissao: number
  observacao?: string
  status: 'pendente' | 'pago'
  criadoEm: number
  pagoEm?: number
}

const DATA_DIR = join(process.cwd(), '.data')
const ARQUIVO = join(DATA_DIR, 'afiliados.json')

interface Estado {
  afiliados: Afiliado[]
  indicacoes: Indicacao[]
  carregado: boolean
}

// Mesmo truque de globalThis do resto do catálogo — sobrevive a HMR em dev.
const CHAVE = Symbol.for('alopara.afiliados.estado')
const g = globalThis as any
const estado: Estado = g[CHAVE] ??= { afiliados: [], indicacoes: [], carregado: false }

async function carregar(): Promise<void> {
  if (estado.carregado)
    return
  estado.carregado = true
  try {
    if (!existsSync(ARQUIVO))
      return
    const dados = JSON.parse(await readFile(ARQUIVO, 'utf-8'))
    if (Array.isArray(dados.afiliados))
      estado.afiliados = dados.afiliados
    if (Array.isArray(dados.indicacoes))
      estado.indicacoes = dados.indicacoes
  }
  catch {
    // Arquivo ausente ou corrompido: segue vazio em vez de travar o site.
  }
}

async function salvar(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${ARQUIVO}.tmp`
  await writeFile(tmp, JSON.stringify({ afiliados: estado.afiliados, indicacoes: estado.indicacoes }), 'utf-8')
  await rename(tmp, ARQUIVO)
}

function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Lista os afiliados, mais recente primeiro. */
export async function listarAfiliados(): Promise<Afiliado[]> {
  await carregar()
  return [...estado.afiliados].sort((a, b) => b.criadoEm - a.criadoEm)
}

export async function criarAfiliado(nome: string, codigoBruto: string, percentual: number, telefone?: string): Promise<Afiliado> {
  await carregar()

  const nomeLimpo = nome.trim()
  if (!nomeLimpo)
    throw new Error('Nome é obrigatório')

  const codigo = normalizarCodigo(codigoBruto)
  if (codigo.length < 3)
    throw new Error('Código precisa ter pelo menos 3 letras/números')
  if (estado.afiliados.some(a => a.codigo === codigo))
    throw new Error('Já existe um afiliado com esse código')

  if (!Number.isFinite(percentual) || percentual <= 0 || percentual > 100)
    throw new Error('Percentual precisa ser um número entre 0 e 100')

  const afiliado: Afiliado = {
    id: randomUUID(),
    nome: nomeLimpo,
    codigo,
    percentual,
    telefone: telefone?.trim() || undefined,
    criadoEm: Date.now(),
  }
  estado.afiliados.push(afiliado)
  await salvar()
  return afiliado
}

/** Remove o afiliado — as indicações antigas continuam na lista (guardam o código, não o vínculo vivo). */
export async function removerAfiliado(id: string): Promise<boolean> {
  await carregar()
  const existia = estado.afiliados.some(a => a.id === id)
  if (!existia)
    return false
  estado.afiliados = estado.afiliados.filter(a => a.id !== id)
  await salvar()
  return true
}

/** Lista as indicações (vendas registradas), mais recente primeiro. */
export async function listarIndicacoes(): Promise<Indicacao[]> {
  await carregar()
  return [...estado.indicacoes].sort((a, b) => b.criadoEm - a.criadoEm)
}

/** Registra uma venda indicada — o admin digita o valor que o atendente confirmou. */
export async function registrarIndicacao(codigoBruto: string, valorCompra: number, observacao?: string): Promise<Indicacao> {
  await carregar()

  const codigo = normalizarCodigo(codigoBruto)
  const afiliado = estado.afiliados.find(a => a.codigo === codigo)
  if (!afiliado)
    throw new Error('Código de afiliado não encontrado')

  if (!Number.isFinite(valorCompra) || valorCompra <= 0)
    throw new Error('Valor da compra precisa ser maior que zero')

  const indicacao: Indicacao = {
    id: randomUUID(),
    afiliadoId: afiliado.id,
    codigo: afiliado.codigo,
    valorCompra,
    comissao: Math.round(valorCompra * (afiliado.percentual / 100) * 100) / 100,
    observacao: observacao?.trim() || undefined,
    status: 'pendente',
    criadoEm: Date.now(),
  }
  estado.indicacoes.push(indicacao)
  await salvar()
  return indicacao
}

/** Alterna pendente ↔ pago — é assim que o admin marca que já acertou com o afiliado. */
export async function alternarStatusIndicacao(id: string): Promise<Indicacao | null> {
  await carregar()
  const indicacao = estado.indicacoes.find(i => i.id === id)
  if (!indicacao)
    return null

  if (indicacao.status === 'pendente') {
    indicacao.status = 'pago'
    indicacao.pagoEm = Date.now()
  }
  else {
    indicacao.status = 'pendente'
    indicacao.pagoEm = undefined
  }
  await salvar()
  return indicacao
}

/** Remove uma indicação lançada errada. */
export async function removerIndicacao(id: string): Promise<boolean> {
  await carregar()
  const existia = estado.indicacoes.some(i => i.id === id)
  if (!existia)
    return false
  estado.indicacoes = estado.indicacoes.filter(i => i.id !== id)
  await salvar()
  return true
}
