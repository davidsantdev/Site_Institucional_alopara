/**
 * Conta quantos cliques em "Finalizar no WhatsApp" o carrinho recebe (ver
 * app/pages/Carrinho.vue → comprarWhatsapp). O Google Analytics já registra
 * o mesmo evento, mas fica só lá — isto é o mesmo número direto no painel do
 * admin, sem precisar abrir o GA4. Mesmo padrão de persistência do resto do
 * admin (encartes, afiliados, pesquisa): globalThis + JSON atômico,
 * sobrevive a HMR.
 */
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

interface Clique {
  criadoEm: number
  valorTotal: number
  quantidadeItens: number
}

const DATA_DIR = join(process.cwd(), '.data')
const ARQUIVO = join(DATA_DIR, 'cliques-whatsapp.json')

interface Estado {
  dados: Clique[]
  carregado: boolean
}

const CHAVE = Symbol.for('alopara.cliquesWhatsapp.estado')
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

export async function registrarCliqueWhatsapp(valorTotal: number, quantidadeItens: number): Promise<void> {
  await carregar()
  estado.dados.push({ criadoEm: Date.now(), valorTotal, quantidadeItens })
  await salvar()
}

export interface ResumoCliquesWhatsapp {
  total: number
  hoje: number
  ultimos7dias: number
  valorTotalEstimado: number
}

/** Números pro card do dashboard — soma tudo em memória, sem custo nenhum nessa escala. */
export async function obterResumoCliquesWhatsapp(): Promise<ResumoCliquesWhatsapp> {
  await carregar()

  const inicioHoje = new Date().setHours(0, 0, 0, 0)
  const seteDiasAtras = Date.now() - 7 * 86_400_000

  let hoje = 0
  let ultimos7dias = 0
  let valorTotalEstimado = 0
  for (const clique of estado.dados) {
    if (clique.criadoEm >= inicioHoje)
      hoje++
    if (clique.criadoEm >= seteDiasAtras)
      ultimos7dias++
    valorTotalEstimado += clique.valorTotal
  }

  return { total: estado.dados.length, hoje, ultimos7dias, valorTotalEstimado }
}
