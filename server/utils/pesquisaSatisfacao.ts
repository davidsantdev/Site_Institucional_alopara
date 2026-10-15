/**
 * Respostas da pesquisa interna de satisfação dos colaboradores — formulário
 * público (sem login, nome e assinatura opcionais) enviado por link direto
 * aos funcionários, nunca linkado em nenhum menu do site (ver
 * app/pages/pesquisa-satisfacao.vue). Mesma persistência em JSON do resto do
 * admin (encartes, afiliados): globalThis + escrita atômica, sobrevive a HMR.
 */
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

export interface RespostaPesquisa {
  id: string
  criadoEm: number
  nome?: string
  setor: string
  tempoEmpresa?: string
  data: string
  /** id da pergunta (ver usePesquisaSatisfacao) → resposta escolhida/escrita. */
  respostas: Record<string, string>
}

const DATA_DIR = join(process.cwd(), '.data')
const ARQUIVO = join(DATA_DIR, 'pesquisa-satisfacao.json')

interface Estado {
  dados: RespostaPesquisa[]
  carregado: boolean
}

const CHAVE = Symbol.for('alopara.pesquisaSatisfacao.estado')
const g = globalThis as any
const estado: Estado = g[CHAVE] ??= { dados: [], carregado: false }

async function carregar(): Promise<void> {
  if (estado.carregado)
    return
  estado.carregado = true
  try {
    if (!existsSync(ARQUIVO))
      return
    const dados = JSON.parse(await readFile(ARQUIVO, 'utf-8'))
    if (Array.isArray(dados))
      estado.dados = dados
  }
  catch {
    // Arquivo ausente ou corrompido: segue com lista vazia em vez de travar o site.
  }
}

async function salvar(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${ARQUIVO}.tmp`
  await writeFile(tmp, JSON.stringify(estado.dados), 'utf-8')
  await rename(tmp, ARQUIVO)
}

/** Lista as respostas, mais recente primeiro. */
export async function listarRespostasPesquisa(): Promise<RespostaPesquisa[]> {
  await carregar()
  return [...estado.dados].sort((a, b) => b.criadoEm - a.criadoEm)
}

export async function registrarRespostaPesquisa(dados: {
  nome?: string
  setor: string
  tempoEmpresa?: string
  data: string
  respostas: Record<string, string>
}): Promise<RespostaPesquisa> {
  await carregar()
  const resposta: RespostaPesquisa = {
    id: randomUUID(),
    criadoEm: Date.now(),
    nome: dados.nome?.trim() || undefined,
    setor: dados.setor.trim(),
    tempoEmpresa: dados.tempoEmpresa?.trim() || undefined,
    data: dados.data,
    respostas: dados.respostas,
  }
  estado.dados.push(resposta)
  await salvar()
  return resposta
}
