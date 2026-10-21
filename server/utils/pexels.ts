/**
 * Banco de fotos do Pexels — licença gratuita pra uso comercial, sem crédito
 * obrigatório. Usado no admin pra achar foto de produto que não tem código de
 * barras (hortifruti, açougue): a pessoa escolhe uma das sugestões e o
 * servidor baixa e guarda como foto do produto. Nunca escolhe sozinho — foto
 * adivinhada automaticamente já deu produto com a foto errada no site.
 *
 * A chave é grátis (pexels.com/api) e fica em PEXELS_API_KEY no .env — sem
 * ela a busca fica desligada, com aviso no painel. O plano grátis permite
 * 200 buscas por hora, por isso o cache por termo.
 */
import process from 'node:process'
import { createError } from 'h3'

const CHAVE = process.env.PEXELS_API_KEY ?? ''
const CACHE_MS = 60 * 60_000
const POR_PAGINA = 15

export interface FotoBanco {
  id: number
  /** ~350px de altura — pra grade de escolha. */
  miniatura: string
  /** Endereço do original — a importação pede o tamanho certo em cima dele. */
  original: string
  alt: string
  autor: string
  autorUrl: string
  /** Página da foto no Pexels. */
  pagina: string
}

const cache = new Map<string, { em: number, fotos: FotoBanco[] }>()

export async function buscarFotos(termo: string): Promise<FotoBanco[]> {
  if (!CHAVE)
    throw createError({ statusCode: 503, statusMessage: 'Busca de fotos desligada: falta a PEXELS_API_KEY no .env do servidor (a chave é grátis em pexels.com/api).' })

  const chaveCache = termo.toLowerCase()
  const salvo = cache.get(chaveCache)
  if (salvo && Date.now() - salvo.em < CACHE_MS)
    return salvo.fotos

  let resposta: any
  try {
    resposta = await $fetch('https://api.pexels.com/v1/search', {
      query: { query: termo, per_page: POR_PAGINA, locale: 'pt-BR' },
      headers: { Authorization: CHAVE },
      timeout: 10_000,
    })
  }
  catch (e: any) {
    const status = e?.status ?? e?.statusCode
    if (status === 401 || status === 403)
      throw createError({ statusCode: 502, statusMessage: 'O Pexels recusou a chave — confira a PEXELS_API_KEY no .env.' })
    if (status === 429)
      throw createError({ statusCode: 429, statusMessage: 'Limite de buscas do Pexels atingido — tente de novo em alguns minutos.' })
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível falar com o Pexels agora.' })
  }

  const fotos: FotoBanco[] = (resposta?.photos ?? [])
    .map((p: any) => ({
      id: Number(p.id),
      miniatura: String(p.src?.medium ?? ''),
      original: String(p.src?.original ?? ''),
      alt: String(p.alt ?? ''),
      autor: String(p.photographer ?? ''),
      autorUrl: String(p.photographer_url ?? ''),
      pagina: String(p.url ?? ''),
    }))
    .filter((f: FotoBanco) => f.miniatura && f.original)

  cache.set(chaveCache, { em: Date.now(), fotos })
  return fotos
}

/**
 * Valida que o endereço é mesmo uma foto do Pexels e devolve a versão no
 * tamanho de foto de produto (quadrada, 800px, comprimida). Só aceita o
 * domínio de imagens do Pexels — o servidor nunca baixa um endereço qualquer
 * que venha do navegador.
 */
export function urlImportacaoPexels(original: string): string | null {
  let url: URL
  try {
    url = new URL(original)
  }
  catch {
    return null
  }
  if (url.protocol !== 'https:' || url.hostname !== 'images.pexels.com' || !url.pathname.startsWith('/photos/'))
    return null
  return `https://images.pexels.com${url.pathname}?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop`
}
