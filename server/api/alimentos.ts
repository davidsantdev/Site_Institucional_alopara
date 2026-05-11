// server/api/alimentos.ts

// ================= TIPOS =================

type Produto = {
  id: string
  nome: string
  preco: number
  preço2: string
  tipo: string
  img: string
  quantidade: number
}

type CacheProdutos = {
  data: Produto[]
  timestamp: number
  total: number
}

// ================= CONFIG =================

const CACHE_DURATION = 1000 * 60 * 60 // 1h
const POR_PAGINA = 48
const MAX_PAGINAS_API = 50             // Aumentado: busca máximo possível
const BATCH_SIZE = 10                  // Lotes paralelos para não sobrecarregar
const AUTH_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token'
const PRODUTOS_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado'

// ================= DEPARTAMENTOS ALIMENTOS =================

const DEPS_ALIMENTOS = new Set([
  'MERCEARIA',
 



  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',

  'BOMBONIERE',
  'MATINAIS',
])

// ================= CACHE GLOBAL =================

let tokenCache: { token: string; expires: number } | null = null
let produtosCache: CacheProdutos | null = null

// ================= TOKEN =================

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

  const credentials = Buffer.from('cisspoder-oauth:poder7547').toString('base64')

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: 'EXECUTOR',
      password: 'ex1234',
    }),
  })

  const data = await res.json()

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return data.access_token
}

// ================= FETCH UMA PÁGINA =================

async function fetchPagina(
  pagina: number,
  headers: Record<string, string>
): Promise<any[]> {
  try {
    const res = await fetch(PRODUTOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ idLoja: '0001', page: pagina }),
      // timeout via AbortController
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return []

    const json = await res.json()

    if (Array.isArray(json)) return json
    if (Array.isArray(json?.data)) return json.data
    if (Array.isArray(json?.produtos)) return json.produtos

    return []
  } catch {
    return []
  }
}

// ================= BUSCAR TODOS OS PRODUTOS =================

async function buscarTodosProdutos(token: string): Promise<Produto[]> {
  // Serve do cache RAM se válido
  if (produtosCache && Date.now() - produtosCache.timestamp < CACHE_DURATION) {
    console.log(`⚡ CACHE HIT: ${produtosCache.total} produtos`)
    return produtosCache.data
  }

  console.log('🔄 BUSCANDO PRODUTOS DA API...')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  // Detecta automaticamente quantas páginas existem com a primeira requisição
  const primeiraRes = await fetchPagina(1, headers)
  const totalPaginasAPI = primeiraRes.length > 0 ? MAX_PAGINAS_API : 1

  // Busca todas as páginas restantes em lotes paralelos
  const paginas = Array.from({ length: totalPaginasAPI - 1 }, (_, i) => i + 2)
  const todasRespostas: any[][] = [primeiraRes]

  for (let i = 0; i < paginas.length; i += BATCH_SIZE) {
    const lote = paginas.slice(i, i + BATCH_SIZE)
    const resultados = await Promise.all(lote.map((p) => fetchPagina(p, headers)))
    todasRespostas.push(...resultados)

    // Para quando uma página retorna vazia (chegou no fim)
    if (resultados.some((r) => r.length === 0)) {
      console.log(`🏁 Fim detectado na página ${lote[resultados.findIndex((r) => r.length === 0)]}`)
      break
    }
  }

  const todos = todasRespostas.flat()
  console.log(`📦 TOTAL BRUTO: ${todos.length}`)

  // Normaliza e filtra com Map para deduplicação O(1)
  const ids = new Map<string, Produto>()

  for (const p of todos) {
    if (p.ativo !== 'S') continue

    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0) continue

    const departamento = String(p.departamento || '').toUpperCase()
    const ehAlimento = DEPS_ALIMENTOS.has(departamento) ||
      [...DEPS_ALIMENTOS].some((d) => departamento.includes(d))

    if (!ehAlimento) continue

    const id = String(p.plu || p.codigoBarra || p.id || '')
    if (!id) continue

    // Evita duplicatas, mantém o de preço mais recente
    if (!ids.has(id)) {
      ids.set(id, {
        id,
        nome: p.nome?.trim() || 'Produto sem nome',
        preco,
        preço2: preco.toFixed(2),
        tipo: p.subcategoria?.replace(/^\d+\s/, '')?.trim()
          || p.categoria?.trim()
          || p.departamento?.trim()
          || 'Alimentos',
        img: p.imageUrl || p.imagem || '',
        quantidade: 1,
      })
    }
  }

  const produtos = Array.from(ids.values())

  // Ordena por nome para listagem consistente
  produtos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  console.log(`✅ TOTAL FINAL: ${produtos.length} produtos únicos`)

  produtosCache = {
    data: produtos,
    timestamp: Date.now(),
    total: produtos.length,
  }

  return produtos
}

// ================= HANDLER =================

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const pagina = Math.max(1, Number(query.pagina || 1))
    const busca = String(query.busca || '').toLowerCase().trim()
    const tipo = String(query.tipo || '').trim()

    const token = await getToken()
    let produtos = await buscarTodosProdutos(token)

    // Filtro de busca por nome
    if (busca) {
      const termos = busca.split(/\s+/).filter(Boolean)
      produtos = produtos.filter((p) => {
        const nome = p.nome.toLowerCase()
        return termos.every((t) => nome.includes(t))
      })
    }

    // Filtro por tipo/categoria
    if (tipo) {
      produtos = produtos.filter(
        (p) => p.tipo.toLowerCase().includes(tipo.toLowerCase())
      )
    }

    // Paginação
    const inicio = (pagina - 1) * POR_PAGINA
    const fim = inicio + POR_PAGINA
    const paginados = produtos.slice(inicio, fim)

    // Headers de cache agressivo para CDN/browser
    setHeaders(event, {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      'X-Total-Produtos': String(produtos.length),
    })

    return {
      produtos: paginados,
      pagina,
      total: produtos.length,
      totalPaginas: Math.ceil(produtos.length / POR_PAGINA),
      temMais: fim < produtos.length,
    }
  } catch (err) {
    console.error('ERRO API:', err)

    setResponseStatus(event, 500)

    return {
      produtos: [],
      pagina: 1,
      total: 0,
      totalPaginas: 0,
      temMais: false
    }
  }
})
