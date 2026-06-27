import { readFile, writeFile } from 'node:fs/promises'
import { existsSync }          from 'node:fs'
import { join }                from 'node:path'

type Produto = {
  id: string
  nome: string
  preco2: string
  tipo: string
  img: string
  quantidade: number
}

type CacheProdutos = {
  data: Produto[]
  timestamp: number
  completo: boolean
}

const CACHE_DURATION     = 1000 * 60 * 60   // 1h validade do cache em memória
const RENOVAR_EM         = 1000 * 60 * 55   // renova proativamente 5min antes
const POR_PAGINA         = 40

const CONCORRENCIA_MIN   = 2
const CONCORRENCIA_MAX   = 3
const TIMEOUT_MS         = 20_000
const MAX_RETRIES        = 3
const DELAY_ENTRE_LOTES  = 150
const TAMANHO_LOTE_BG    = 4
const MAX_PAGINAS_VAZIAS = 5
const MAX_PAGINAS_API    = 500
const PAGINAS_INICIAIS   = 5

const CACHE_FILE = join(process.cwd(), '.cache', 'perfumaria.json')

const DEPS_PERFUMARIA = [
  'HIGIENE',
  'HIGIENE PESSOAL',
  'CABELOS',
  'CAPILAR',
  'PERFUMARIA',
  'COSMETICOS',
  'COSMÉTICOS',
  'BELEZA',
  'CUIDADOS PESSOAIS',
  'CUIDADO PESSOAL',
  'FRALDAS',
  'BEBE',
  'BEBÊ',
  'INFANTIL',
  'ABSORVENTE',
  'SABONETE',
  'SHAMPOO',
  'CONDICIONADOR',
  'CREME',
  'DESODORANTE',
  'DENTAL',
  'ORAL',
  'ESCOVA',
  'PASTA',
  'ENXAGUANTE',
  'PAPEL',
]

const BASE_URL = 'https://aloparacim.dataciss.com.br:443'

const POSTMAN_HEADERS = {
  'User-Agent':      'PostmanRuntime/7.54.0',
  'Accept':          '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection':      'keep-alive',
}

let tokenCache:       { token: string; expires: number } | null = null
let produtosCache:    CacheProdutos | null = null
let backgroundRodando = false
let warmupFeito       = false
let timeoutsRecentes  = 0

async function lerCacheDisco(): Promise<CacheProdutos | null> {
  try {
    if (!existsSync(CACHE_FILE)) return null
    const raw  = await readFile(CACHE_FILE, 'utf-8')
    const data = JSON.parse(raw) as CacheProdutos
    console.log(`💾 Cache perfumaria do disco: ${data.data.length} produtos`)
    return data
  } catch {
    return null
  }
}

async function salvarCacheDisco(cache: CacheProdutos): Promise<void> {
  try {
    const { mkdir } = await import('node:fs/promises')
    await mkdir(join(process.cwd(), '.cache'), { recursive: true })
    await writeFile(CACHE_FILE, JSON.stringify(cache), 'utf-8')
    console.log(`💾 Cache perfumaria salvo: ${cache.data.length} produtos`)
  } catch (err) {
    console.error('Erro ao salvar cache de perfumaria:', err)
  }
}

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token

  const res = await fetch(
    'https://aloparacim.dataciss.com.br/cisspoder-auth/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept':        'application/json',
        'User-Agent':    'PostmanRuntime/7.54.0',
      },
      body: new URLSearchParams({
        username:      '109',
        password:      '123456',
        grant_type:    'password',
        client_secret: 'poder7547',
        client_id:     'cisspoder-oauth',
      }),
    }
  )

  const data = JSON.parse(await res.text())
  if (!data?.access_token) throw new Error(`Token inválido: ${JSON.stringify(data)}`)

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return data.access_token
}

function criarSemaforo(max: number) {
  let ativo  = 0
  let limite = max
  const fila: Array<() => void> = []

  function adquirir(): Promise<void> {
    return new Promise((resolve) => {
      if (ativo < limite) {
        ativo++
        resolve()
      } else {
        fila.push(() => {
          ativo++
          resolve()
        })
      }
    })
  }

  function liberar() {
    ativo--
    fila.shift()?.()
  }

  function reduzir() {
    if (limite > CONCORRENCIA_MIN) {
      limite = CONCORRENCIA_MIN
      console.warn(`⚠️ Semáforo reduzido para ${limite}`)
    }
  }

  return { adquirir, liberar, reduzir }
}

const semaforo = criarSemaforo(CONCORRENCIA_MAX)

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function montarImagem(codigoBarra: string | number | null | undefined): string {
  if (!codigoBarra) return ''
  const cod = String(codigoBarra).trim()
  if (!cod || cod === '0') return ''
  return `https://cdn.cisslive.com.br/images/${cod}_1.jpg`
}

async function buscarPagina(
  pagina: number,
  headers: Record<string, string>
): Promise<any[]> {
  for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
    await semaforo.adquirir()

    try {
      const res = await fetch(`${BASE_URL}/cisspoder-service/get_produtos_sitemercado`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idLoja: '0001',
          page: pagina,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      const json  = await res.json()
      const dados = Array.isArray(json) ? json : (json?.data ?? [])

      timeoutsRecentes = 0
      return dados
    } catch (err: any) {
      const ehTimeout =
        err?.name === 'TimeoutError' ||
        err?.message?.includes('timeout')

      if (ehTimeout && ++timeoutsRecentes >= 2) semaforo.reduzir()

      if (tentativa < MAX_RETRIES) {
        await sleep(tentativa * 1500)
      } else {
        console.error(`❌ Pág ${pagina} desistida:`, ehTimeout ? 'timeout' : err?.message)
        return []
      }
    } finally {
      semaforo.liberar()
    }
  }

  return []
}

function ehPerfumaria(p: any): boolean {
  const texto = [
    p.departamento,
    p.categoria,
    p.subcategoria,
    p.nome,
    p.descricao,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()

  return DEPS_PERFUMARIA.some((d) => texto.includes(d))
}

function normalizarProdutos(brutos: any[], ids: Set<string>): Produto[] {
  const result: Produto[] = []

  for (const p of brutos) {
    if (p.ativo !== 'S') continue

    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0) continue

    if (!ehPerfumaria(p)) continue

    const id = String(p.plu || p.codigoBarra || p.id || crypto.randomUUID())
    if (ids.has(id)) continue

    ids.add(id)

    const img =
      p.imageUrl?.trim() ||
      p.imagem?.trim() ||
      montarImagem(p.nrcodbarprod || p.codigoBarra)

    result.push({
      id,
      nome:   p.nome?.trim() || 'Produto sem nome',
      preco2: preco.toFixed(2),
      tipo:
        p.subcategoria?.replace(/^\d+\s/, '')?.trim() ||
        p.categoria?.trim() ||
        p.departamento?.trim() ||
        'Perfumaria',
      img,
      quantidade: 1,
    })
  }

  return result
}

async function buscarTodosProdutos(token: string): Promise<Produto[]> {
  if (
    produtosCache?.completo &&
    Date.now() - produtosCache.timestamp < CACHE_DURATION
  ) {
    return produtosCache.data
  }

  if (backgroundRodando && produtosCache) return produtosCache.data

  const headers = {
    ...POSTMAN_HEADERS,
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  }

  const disco = await lerCacheDisco()

  if (disco && disco.data.length > 0) {
    produtosCache = disco

    const precisaAtualizar = Date.now() - disco.timestamp > RENOVAR_EM

    if (precisaAtualizar && !backgroundRodando) {
      console.log('🔄 Cache perfumaria antigo — atualizando em background...')
      rodarBackground(headers)
    }

    return disco.data
  }

  console.log(`🚀 Lote inicial perfumaria: ${PAGINAS_INICIAIS} páginas`)

  const ids = new Set<string>()

  const dadosIniciais = await Promise.all(
    Array.from({ length: PAGINAS_INICIAIS }, (_, i) =>
      buscarPagina(i + 1, headers)
    )
  )

  const produtosIniciais = normalizarProdutos(dadosIniciais.flat(), ids)

  produtosCache = {
    data: produtosIniciais,
    timestamp: 0,
    completo: false,
  }

  console.log('✅ Lote inicial perfumaria:', produtosIniciais.length, 'produtos')

  rodarBackground(headers, PAGINAS_INICIAIS + 1, ids)

  return produtosIniciais
}

function rodarBackground(
  headers: Record<string, string>,
  paginaInicial = 1,
  idsExistentes?: Set<string>,
) {
  if (backgroundRodando) return

  backgroundRodando = true

  ;(async () => {
    try {
      const ids = idsExistentes ?? new Set(
        (produtosCache?.data ?? []).map((p) => p.id)
      )

      const todos = [...(produtosCache?.data ?? [])]

      let pagina        = paginaInicial
      let paginasVazias = 0

      while (pagina <= MAX_PAGINAS_API) {
        const lote = Array.from({ length: TAMANHO_LOTE_BG }, (_, i) =>
          buscarPagina(pagina + i, headers)
        )

        const resultados = await Promise.all(lote)

        let novosNoLote = 0

        for (const dados of resultados) {
          if (dados.length === 0) {
            paginasVazias++
          } else {
            paginasVazias = 0

            const novos = normalizarProdutos(dados, ids)
            todos.push(...novos)
            novosNoLote += novos.length
          }
        }

        if (novosNoLote > 0) {
          produtosCache = {
            data: [...todos],
            timestamp: 0,
            completo: false,
          }

          console.log(
            `📦 Perfumaria págs ${pagina}–${pagina + TAMANHO_LOTE_BG - 1}: +${novosNoLote} → ${todos.length} total`
          )
        } else {
          console.log(
            `🔎 Perfumaria págs ${pagina}–${pagina + TAMANHO_LOTE_BG - 1}: nenhum novo | vazias ${paginasVazias}/${MAX_PAGINAS_VAZIAS}`
          )
        }

        if (paginasVazias >= MAX_PAGINAS_VAZIAS) {
          console.log('🏁 API perfumaria esgotada')
          break
        }

        pagina += TAMANHO_LOTE_BG

        if (DELAY_ENTRE_LOTES > 0) await sleep(DELAY_ENTRE_LOTES)
      }

      const cacheCompleto: CacheProdutos = {
        data: todos,
        timestamp: Date.now(),
        completo: true,
      }

      produtosCache = cacheCompleto

      console.log('🏁 Cache perfumaria completo:', todos.length, 'produtos')

      await salvarCacheDisco(cacheCompleto)

      agendarRenovacao(headers)
    } finally {
      backgroundRodando = false
    }
  })()
}

function agendarRenovacao(headers: Record<string, string>) {
  setTimeout(async () => {
    console.log('🔄 Renovando cache perfumaria...')

    try {
      if (produtosCache) {
        produtosCache = {
          ...produtosCache,
          completo: false,
          timestamp: 0,
        }
      }

      rodarBackground(headers, 1)
    } catch (err) {
      console.error('Erro na renovação de perfumaria:', err)
      setTimeout(() => agendarRenovacao(headers), 5 * 60 * 1000)
    }
  }, RENOVAR_EM)
}

async function warmupCache() {
  if (warmupFeito || backgroundRodando) return

  warmupFeito = true

  console.log('🔥 Boot perfumaria...')

  const disco = await lerCacheDisco()

  if (disco && disco.data.length > 0) {
    produtosCache = disco

    console.log(`⚡ Perfumaria pré-aquecida com ${disco.data.length} produtos`)

    if (Date.now() - disco.timestamp < RENOVAR_EM) {
      const tempoRestante = RENOVAR_EM - (Date.now() - disco.timestamp)

      try {
        const token = await getToken()

        const headers = {
          ...POSTMAN_HEADERS,
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        }

        setTimeout(() => agendarRenovacao(headers), tempoRestante)
      } catch {}

      return
    }
  }

  try {
    const token = await getToken()
    await buscarTodosProdutos(token)
  } catch (err) {
    console.error('Erro no warmup perfumaria:', err)
    warmupFeito = false
  }
}

warmupCache()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const pagina = Math.max(1, Number(query.pagina || 1))
    const busca  = String(query.busca || '').toLowerCase().trim()

    const token = await getToken()

    let produtos = await buscarTodosProdutos(token)

    if (busca) {
      produtos = produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca) ||
        p.tipo.toLowerCase().includes(busca)
      )
    }

    const inicio    = (pagina - 1) * POR_PAGINA
    const paginados = produtos.slice(inicio, inicio + POR_PAGINA)

    setHeader(event, 'Cache-Control', 'public, max-age=30, stale-while-revalidate=60')

    return {
      produtos: paginados,
      pagina,
      total: produtos.length,
      totalPaginas: Math.max(1, Math.ceil(produtos.length / POR_PAGINA)),
      temMais: inicio + POR_PAGINA < produtos.length,
      cacheCompleto: produtosCache?.completo ?? false,
    }
  } catch (err) {
    console.error('ERRO API PERFUMARIA:', err)

    return {
      produtos: [],
      pagina: 1,
      total: 0,
      totalPaginas: 1,
      temMais: false,
      cacheCompleto: false,
    }
  }
})