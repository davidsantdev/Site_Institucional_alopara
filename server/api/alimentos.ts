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

const CACHE_DURATION  = 1000 * 60 * 60 // 1h
const POR_PAGINA      = 40
const MAX_PAGINAS_API = 20
const LOTE_INICIAL    = 1  // ← só 1 página para responder ~rápido (~0.3s)
const LOTE_BACKGROUND = 6  // ← 6 páginas por rodada em background

const DEPS_ALIMENTOS = [
  'MERCEARIA', 'BEBIDAS', 'HORTIFRUTI', 'PADARIA',
  'AUTO SERVIÇO', 'PAS', 'FRIOS', 'LATICINIOS',
  'CONGELADOS', 'ACOUGUE', 'BOMBONIERE', 'MATINAIS',
]

const BASE_URL = 'https://aloparacim.dataciss.com.br:443'

const POSTMAN_HEADERS = {
  'User-Agent':      'PostmanRuntime/7.54.0',
  'Accept':          '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection':      'keep-alive',
}

// ================= TOKEN =================

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

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
    token:   data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return data.access_token
}

// ================= HELPERS =================

/**
 * Monta a URL da imagem do CDN CISS a partir do código de barras.
 * Padrão: https://cdn.cisslive.com.br/images/{codigoBarra}_1.jpg
 * Se não houver código de barras válido, retorna string vazia
 * e o frontend usará o fallback /sem-imagem.png via @error.
 */
function montarImagem(codigoBarra: string | number | null | undefined): string {
  if (!codigoBarra) return ''
  const cod = String(codigoBarra).trim()
  if (!cod || cod === '0') return ''
  return `https://cdn.cisslive.com.br/images/${cod}_1.jpg`
}

async function buscarPagina(pagina: number, headers: Record<string, string>) {
  try {
    const res = await fetch(`${BASE_URL}/cisspoder-service/get_produtos_sitemercado`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ idLoja: '0001', page: pagina }),
      signal:  AbortSignal.timeout(8000),
    })
    const json = await res.json()
    return Array.isArray(json) ? json : (json?.data ?? [])
  } catch (err) {
    console.error(`Erro página ${pagina}:`, err)
    return []
  }
}

function normalizarProdutos(brutos: any[], ids: Set<string>): Produto[] {
  const result: Produto[] = []

  for (const p of brutos) {
    if (p.ativo !== 'S') continue

    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0) continue

    const dep = String(p.departamento || '').toUpperCase()
    if (!DEPS_ALIMENTOS.some((d) => dep.includes(d))) continue

    const id = String(p.plu || p.codigoBarra || p.id || crypto.randomUUID())
    if (ids.has(id)) continue
    ids.add(id)

    // Prioridade de imagem:
    // 1. imageUrl / imagem já fornecidos pela API
    // 2. CDN CISS montado pelo código de barras (nrcodbarprod ou codigoBarra)
    // 3. String vazia → frontend mostra /sem-imagem.png via @error
    const img =
      p.imageUrl?.trim() ||
      p.imagem?.trim() ||
      montarImagem(p.nrcodbarprod || p.codigoBarra)

    result.push({
      id,
      nome:     p.nome?.trim() || 'Produto sem nome',
      preco2:   preco.toFixed(2),
      tipo:
        p.subcategoria?.replace(/^\d+\s/, '')?.trim() ||
        p.categoria?.trim() ||
        p.departamento?.trim() ||
        'Alimentos',
      img,
      quantidade: 1,
    })
  }

  return result
}

// ================= CACHE + BACKGROUND =================

async function buscarTodosProdutos(token: string): Promise<Produto[]> {
  // Cache completo e válido
  if (produtosCache?.completo && Date.now() - produtosCache.timestamp < CACHE_DURATION) {
    console.log('⚡ Cache completo:', produtosCache.data.length)
    return produtosCache.data
  }

  // Cache parcial ainda construindo — retorna o que há
  if (produtosCache && backgroundRodando) {
    console.log('⚡ Cache parcial:', produtosCache.data.length)
    return produtosCache.data
  }

  const headers = {
    ...POSTMAN_HEADERS,
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
  }

  // ── Lote inicial: 1 página só para responder rápido ──
  console.log('🚀 Lote inicial (1 página)...')
  const [respostaInicial] = await Promise.all([buscarPagina(1, headers)])
  const ids = new Set<string>()
  const produtosIniciais = normalizarProdutos(respostaInicial, ids)

  console.log('✅ Lote inicial:', produtosIniciais.length)

  produtosCache = { data: produtosIniciais, timestamp: 0, completo: false }

  // ── Background: resto das páginas em lotes de 6 ──
  backgroundRodando = true
  ;(async () => {
    try {
      const todos = [...produtosIniciais]

      for (let i = 2; i <= MAX_PAGINAS_API; i += LOTE_BACKGROUND) {
        const qtd  = Math.min(LOTE_BACKGROUND, MAX_PAGINAS_API - i + 1)
        const lote = Array.from({ length: qtd }, (_, j) => buscarPagina(i + j, headers))

        const resultados = await Promise.all(lote)
        const novos = normalizarProdutos(resultados.flat(), ids)
        todos.push(...novos)

        produtosCache = { data: [...todos], timestamp: 0, completo: false }
        console.log(`📦 Background págs ${i}–${i + qtd - 1}: +${novos.length} → ${todos.length}`)
      }

      produtosCache = { data: todos, timestamp: Date.now(), completo: true }
      console.log('🏁 Cache completo:', todos.length)
    } finally {
      backgroundRodando = false
    }
  })()

  return produtosIniciais
}

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
    console.error('ERRO API:', err)
    return {
      produtos: [], pagina: 1, total: 0,
      totalPaginas: 0, temMais: false, cacheCompleto: false,
    }
  }
})