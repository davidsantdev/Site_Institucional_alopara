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
const MAX_PAGINAS_API = 20   // Realista — ajuste conforme logs mostrarem o real
const CONCORRENCIA = 20      // Todas as páginas de uma vez, com AbortController

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
  // Adicionados — variações comuns na API
  'PADARIA',
  'HORTIFRUTI',
  'ACOUGUE',
  'PEIXARIA',
  'BEBIDAS',
  'GRANEL',
  'ROTISSERIA',
  'ALIMENTOS',
  'TEMPEROS',
  'CONDIMENTOS',
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
  headers: Record<string, string>,
  signal?: AbortSignal
): Promise<any[]> {
  try {
    const res = await fetch(PRODUTOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ idLoja: '0001', page: pagina }),
      signal: signal ?? AbortSignal.timeout(15_000),
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

// ================= BUSCAR TODOS OS PRODUTOS (PARALELO TOTAL) =================

async function buscarTodosProdutos(token: string): Promise<Produto[]> {
  if (produtosCache && Date.now() - produtosCache.timestamp < CACHE_DURATION) {
    console.log(`⚡ CACHE HIT: ${produtosCache.total} produtos`)
    return produtosCache.data
  }

  console.log('🔄 BUSCANDO PRODUTOS DA API...')
  const inicio = Date.now()

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  // AbortController compartilhado — cancela todas quando detecta fim
  const controller = new AbortController()
  const { signal } = controller

  // Dispara TODAS as páginas ao mesmo tempo
  const paginas = Array.from({ length: MAX_PAGINAS_API }, (_, i) => i + 1)

  const resultados = await Promise.all(
    paginas.map(async (pagina) => {
      const dados = await fetchPagina(pagina, headers, signal)

      // Se uma página veio vazia, cancela as demais (já no fim da API)
      if (dados.length === 0 && !signal.aborted) {
        console.log(`🏁 Fim detectado na página ${pagina}, cancelando restantes`)
        controller.abort()
      }

      return dados
    })
  )

  const todos = resultados.flat()
  console.log(`📦 TOTAL BRUTO: ${todos.length} | ⏱️ ${Date.now() - inicio}ms`)

  // Normaliza e deduplica com Map O(1)
  const ids = new Map<string, Produto>()

  for (const p of todos) {
    if (p.ativo !== 'S') continue

    const preco = Number(p.vlrProduto)
    if (!preco || preco <= 0) continue

    const departamento = String(p.departamento || '').toUpperCase().trim()
    const ehAlimento = DEPS_ALIMENTOS.has(departamento) ||
      [...DEPS_ALIMENTOS].some((d) => departamento.includes(d))

    if (!ehAlimento) continue

    const id = String(p.plu || p.codigoBarra || p.id || '')
    if (!id || ids.has(id)) continue

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

  const produtos = Array.from(ids.values())
  produtos.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  console.log(`✅ TOTAL FINAL: ${produtos.length} únicos | ⏱️ ${Date.now() - inicio}ms`)

  // Log dos departamentos encontrados para você calibrar DEPS_ALIMENTOS
  const depsFora = new Set<string>()
  for (const p of todos) {
    const dep = String(p.departamento || '').toUpperCase().trim()
    if (dep && !DEPS_ALIMENTOS.has(dep)) depsFora.add(dep)
  }
  console.log('📋 DEPS NÃO INCLUÍDOS:', [...depsFora].slice(0, 30))

  produtosCache = { data: produtos, timestamp: Date.now(), total: produtos.length }

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

    if (busca) {
      const termos = busca.split(/\s+/).filter(Boolean)
      produtos = produtos.filter((p) => {
        const nome = p.nome.toLowerCase()
        return termos.every((t) => nome.includes(t))
      })
    }

    if (tipo) {
      const tipoLower = tipo.toLowerCase()
      produtos = produtos.filter((p) => p.tipo.toLowerCase().includes(tipoLower))
    }

    const inicio = (pagina - 1) * POR_PAGINA
    const fim = inicio + POR_PAGINA

    setHeaders(event, {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      'X-Total-Produtos': String(produtos.length),
    })

    return {
      produtos: produtos.slice(inicio, fim),
      pagina,
      total: produtos.length,
      totalPaginas: Math.ceil(produtos.length / POR_PAGINA),
      temMais: fim < produtos.length,
    }
  } catch (err) {
    console.error('ERRO API:', err)
    setResponseStatus(event, 500)
    return { produtos: [], pagina: 1, total: 0, totalPaginas: 0, temMais: false }
  }
})