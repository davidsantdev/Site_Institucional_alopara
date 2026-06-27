import { Agent } from 'node:https'

let tokenCache: {
  token: string
  expires: number
} | null = null

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

let produtosCache: CacheProdutos | null = null
let backgroundRodando = false
let warmupFeito = false

const CACHE_DURATION     = 1000 * 60 * 60
const RENOVAR_EM         = 1000 * 60 * 55
const POR_PAGINA         = 40
const MAX_PAGINAS_API    = 500
const LOTE_INICIAL       = 2
const LOTE_BACKGROUND    = 2
const MAX_PAGINAS_VAZIAS = 15
const TIMEOUT_MS         = 30_000
const MAX_RETRIES        = 3
const DELAY_ENTRE_LOTES  = 800

const DEPS_BEBIDAS = [
  'BEBIDAS', 'SUCOS', 'REFRIGERANTES', 'CERVEJAS',
  'AGUAS', 'DESTILADOS', 'VINHOS', 'ENERGETICOS',
]

const BASE_URL = 'https://aloparacim.dataciss.com.br:443'

// dispatcher com headersTimeout e bodyTimeout generosos
let _dispatcher: any = null
async function getDispatcher() {
  if (_dispatcher) return _dispatcher
  try {
    const { Agent } = await import('undici')
    _dispatcher = new Agent({
      headersTimeout:    30_000,
      bodyTimeout:       30_000,
      connectTimeout:    30_000,
      keepAliveTimeout:  10_000,
    })
  } catch {
    _dispatcher = undefined
  }
  return _dispatcher
}

const POSTMAN_HEADERS = {
  'User-Agent':      'PostmanRuntime/7.54.0',
  'Accept':          '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection':      'keep-alive',
}

// ================= TOKEN =================

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token

  const dispatcher = await getDispatcher()
  const opts: any = {
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
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }
  if (dispatcher) opts.dispatcher = dispatcher

  const res  = await fetch('https://aloparacim.dataciss.com.br/cisspoder-auth/oauth/token', opts)
  const data = JSON.parse(await res.text())
  if (!data?.access_token) throw new Error(`Token inválido: ${JSON.stringify(data)}`)

  tokenCache = { token: data.access_token, expires: Date.now() + 55 * 60 * 1000 }
  return data.access_token
}

// ================= HELPERS =================

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

function montarImagem(codigoBarra: string | number | null | undefined): string {
  if (!codigoBarra) return ''
  const cod = String(codigoBarra).trim()
  if (!cod || cod === '0') return ''
  return `https://cdn.cisslive.com.br/images/${cod}_1.jpg`
}

async function buscarPagina(pagina: number, headers: Record<string, string>): Promise<any[]> {
  const dispatcher = await getDispatcher()
  for (let tentativa = 1; tentativa <= MAX_RETRIES; tentativa++) {
    try {
      const opts: any = {
        method:  'POST',
        headers,
        body:    JSON.stringify({ idLoja: '0001', page: pagina }),
        signal:  AbortSignal.timeout(TIMEOUT_MS),
      }
      if (dispatcher) opts.dispatcher = dispatcher

      const res  = await fetch(`${BASE_URL}/cisspoder-service/get_produtos_sitemercado`, opts)
      const json = await res.json()
      return Array.isArray(json) ? json : (json?.data ?? [])
    } catch (err: any) {
      if (tentativa < MAX_RETRIES) {
        const espera = tentativa * 2000
        console.warn(`⏳ Pág ${pagina} tentativa ${tentativa}/${MAX_RETRIES} — aguardando ${espera}ms`)
        await sleep(espera)
      } else {
        console.error(`❌ Pág ${pagina} desistida após ${MAX_RETRIES} tentativas`)
        return []
      }
    }
  }
  return []
}

function normalizarProdutos(brutos: any[], ids: Set<string>): Produto[] {
  const result: Produto[] = []
  for (const p of brutos) {
    if (p.ativo !== 'S') continue
    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0) continue
    const dep = String(p.departamento || '').toUpperCase()
    if (!DEPS_BEBIDAS.some((d) => dep.includes(d))) continue
    const id = String(p.plu || p.codigoBarra || p.id || crypto.randomUUID())
    if (ids.has(id)) continue
    ids.add(id)
    const img = p.imageUrl?.trim() || p.imagem?.trim() || montarImagem(p.nrcodbarprod || p.codigoBarra)
    result.push({
      id,
      nome:   p.nome?.trim() || 'Produto sem nome',
      preco2: preco.toFixed(2),
      tipo:
        p.subcategoria?.replace(/^\d+\s/, '')?.trim() ||
        p.categoria?.trim() ||
        p.departamento?.trim() ||
        'Bebidas',
      img,
      quantidade: 1,
    })
  }
  return result
}

// ================= BUSCA COMPLETA =================

async function buscarTodosProdutos(token: string): Promise<Produto[]> {
  if (produtosCache?.completo && Date.now() - produtosCache.timestamp < CACHE_DURATION) {
    return produtosCache.data
  }
  if (produtosCache && backgroundRodando) return produtosCache.data

  const headers = {
    ...POSTMAN_HEADERS,
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  }

  console.log(`🚀 Lote inicial (${LOTE_INICIAL} páginas)...`)
  const paginasIniciais = await Promise.all(
    Array.from({ length: LOTE_INICIAL }, (_, i) => buscarPagina(i + 1, headers))
  )

  const ids = new Set<string>()
  const produtosIniciais = normalizarProdutos(paginasIniciais.flat(), ids)
  console.log('✅ Lote inicial:', produtosIniciais.length, 'produtos')

  produtosCache = { data: produtosIniciais, timestamp: 0, completo: false }

  backgroundRodando = true
  ;(async () => {
    try {
      const todos = [...produtosIniciais]
      let pagina = LOTE_INICIAL + 1
      let paginasVazias = 0

      while (pagina <= MAX_PAGINAS_API) {
        const qtd  = Math.min(LOTE_BACKGROUND, MAX_PAGINAS_API - pagina + 1)
        const lote = Array.from({ length: qtd }, (_, j) => buscarPagina(pagina + j, headers))
        const resultados = await Promise.all(lote)
        const brutos = resultados.flat()

        if (brutos.length === 0) {
          paginasVazias++
          if (paginasVazias >= MAX_PAGINAS_VAZIAS) {
            console.log(`🏁 API esgotada`)
            break
          }
        } else {
          paginasVazias = 0
          const novos = normalizarProdutos(brutos, ids)
          todos.push(...novos)
          produtosCache = { data: [...todos], timestamp: 0, completo: false }
          console.log(`📦 Págs ${pagina}–${pagina + qtd - 1}: +${novos.length} → ${todos.length}`)
        }

        pagina += qtd
        await sleep(DELAY_ENTRE_LOTES)
      }

      produtosCache = { data: todos, timestamp: Date.now(), completo: true }
      console.log('🏁 Cache completo:', todos.length, 'produtos')
      agendarRenovacao()
    } finally {
      backgroundRodando = false
    }
  })()

  return produtosIniciais
}

// ================= WARMUP + RENOVAÇÃO =================

function agendarRenovacao() {
  setTimeout(async () => {
    console.log('🔄 Renovando cache...')
    try {
      if (produtosCache) produtosCache = { ...produtosCache, completo: false, timestamp: 0 }
      const token = await getToken()
      await buscarTodosProdutos(token)
    } catch (err) {
      console.error('Erro na renovação:', err)
      setTimeout(agendarRenovacao, 5 * 60 * 1000)
    }
  }, RENOVAR_EM)
}

async function warmupCache() {
  if (warmupFeito || backgroundRodando) return
  warmupFeito = true
  console.log('🔥 Aquecendo cache bebidas...')
  try {
    const token = await getToken()
    await buscarTodosProdutos(token)
  } catch (err) {
    console.error('Erro no warmup bebidas:', err)
    warmupFeito = false
  }
}

warmupCache()

// ================= HANDLER =================

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const pagina = Math.max(1, Number(query.pagina || 1))
    const busca  = String(query.busca || '').toLowerCase().trim()

    const token    = await getToken()
    let   produtos = await buscarTodosProdutos(token)

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
      produtos:      paginados,
      pagina,
      total:         produtos.length,
      totalPaginas:  Math.ceil(produtos.length / POR_PAGINA),
      temMais:       inicio + POR_PAGINA < produtos.length,
      cacheCompleto: produtosCache?.completo ?? false,
    }
  } catch (err) {
    console.error('ERRO API bebidas:', err)
    return { produtos: [], pagina: 1, total: 0, totalPaginas: 0, temMais: false, cacheCompleto: false }
  }
})