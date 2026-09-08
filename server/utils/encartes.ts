import { randomUUID } from 'node:crypto'
/**
 * Encartes — a arte semanal de promoção que o admin sobe na mão pelo painel,
 * pros clientes acompanharem sem depender de nenhuma API externa (CISS,
 * Mercafácil). É conteúdo puro: uma imagem + um título, nada mais.
 *
 * Reaproveita `UPLOADS_DIR` (mesma pasta das fotos de produto, ver
 * server/utils/catalogo.ts) numa subpasta própria — a rota que já serve
 * uploads (server/routes/uploads/[...path].get.ts) funciona sem mudar nada,
 * porque ela aceita qualquer caminho dentro de UPLOADS_DIR.
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { UPLOADS_DIR } from './catalogo'

export interface Encarte {
  id: string
  titulo: string
  /** Nome do arquivo dentro de ENCARTES_DIR — a URL pública é /uploads/encartes/<arquivo>. */
  arquivo: string
  criadoEm: number
}

const DATA_DIR = join(process.cwd(), '.data')
const ENCARTES_FILE = join(DATA_DIR, 'encartes.json')
export const ENCARTES_DIR = join(UPLOADS_DIR, 'encartes')

interface EstadoEncartes {
  dados: Encarte[]
  carregado: boolean
}

// Mesmo truque de globalThis do resto do catálogo — sobrevive a HMR em dev.
const CHAVE = Symbol.for('alopara.encartes.estado')
const g = globalThis as any
const estado: EstadoEncartes = g[CHAVE] ??= { dados: [], carregado: false }

async function carregar(): Promise<void> {
  if (estado.carregado)
    return
  estado.carregado = true
  try {
    if (!existsSync(ENCARTES_FILE))
      return
    const dados = JSON.parse(await readFile(ENCARTES_FILE, 'utf-8'))
    if (Array.isArray(dados))
      estado.dados = dados
  }
  catch {
    // Arquivo ausente ou corrompido: segue com lista vazia em vez de travar o site.
  }
}

async function salvar(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${ENCARTES_FILE}.tmp`
  await writeFile(tmp, JSON.stringify(estado.dados), 'utf-8')
  await rename(tmp, ENCARTES_FILE)
}

/** Lista os encartes, mais recente primeiro. */
export async function listarEncartes(): Promise<Encarte[]> {
  await carregar()
  return [...estado.dados].sort((a, b) => b.criadoEm - a.criadoEm)
}

/** Registra um encarte novo — o arquivo já deve estar salvo em ENCARTES_DIR antes de chamar isto. */
export async function adicionarEncarte(titulo: string, nomeArquivo: string): Promise<Encarte> {
  await carregar()
  const encarte: Encarte = {
    id: randomUUID(),
    titulo: titulo.trim() || 'Encarte',
    arquivo: nomeArquivo,
    criadoEm: Date.now(),
  }
  estado.dados.push(encarte)
  await salvar()
  return encarte
}

/** Remove um encarte — apaga o metadado e o arquivo em disco. */
export async function removerEncarte(id: string): Promise<boolean> {
  await carregar()
  const encarte = estado.dados.find(e => e.id === id)
  if (!encarte)
    return false

  estado.dados = estado.dados.filter(e => e.id !== id)
  await salvar()
  await rm(join(ENCARTES_DIR, encarte.arquivo)).catch(() => {})
  return true
}
