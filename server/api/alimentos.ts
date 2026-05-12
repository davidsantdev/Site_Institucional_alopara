// server/api/alimentos.ts

let tokenCache: {
  token: string
  expires: number
} | null = null

type Produto = {
  id: string
  nome: string
  preço2: string
  tipo: string
  img: string
  quantidade: number
}

type CacheProdutos = {
  data: Produto[]
  timestamp: number
}

let produtosCache: CacheProdutos | null = null

const CACHE_DURATION = 1000 * 60 * 60 // 1h
const POR_PAGINA = 40
const MAX_PAGINAS_API = 20

// ================= ALIMENTOS =================

const DEPS_ALIMENTOS = [
  'MERCEARIA',
  'BEBIDAS',
  'HORTIFRUTI',
  'PADARIA',
  'AUTO SERVIÇO',
  'PAS',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',
  'ACOUGUE',
  'BOMBONIERE',
  'MATINAIS'
]

// ================= TOKEN =================

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

  const credentials = Buffer.from(
    'cisspoder-oauth:poder7547'
  ).toString('base64')

  const controller = new AbortController()
  setTimeout(() => controller.abort(), 10000)

  const res = await fetch(
    'https://aloparacim.dataciss.com.br:443/cisspoder-auth/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: 'EXECUTOR',
        password: 'ex1234'
      }),
      signal: controller.signal
    }
  )

  if (!res.ok) {
    throw new Error(`Erro ao gerar token: ${res.status}`)
  }

  const data = await res.json()

  if (!data?.access_token) {
    throw new Error('Token inválido')
  }

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000
  }

  return data.access_token
}

// ================= BUSCAR PRODUTOS =================

async function buscarTodosProdutos(token: string) {
  if (
    produtosCache &&
    Date.now() - produtosCache.timestamp < CACHE_DURATION
  ) {
    console.log('⚡ CACHE:', produtosCache.data.length)
    return produtosCache.data
  }

  console.log('🔄 BUSCANDO API...')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  const todos: any[] = []

  const LOTE = 5 // 🔥 controla paralelismo

  for (let i = 0; i < MAX_PAGINAS_API; i += LOTE) {
    const batch = Array.from({ length: LOTE }, async (_, j) => {
      const pagina = i + j + 1
      if (pagina > MAX_PAGINAS_API) return []

      try {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 10000)

        const res = await fetch(
          'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              idLoja: '0001',
              page: pagina
            }),
            signal: controller.signal
          }
        )

        if (!res.ok) {
          console.error(`Erro página ${pagina}:`, res.status)
          return []
        }

        const json = await res.json()

        return Array.isArray(json)
          ? json
          : json?.data ?? []
      } catch (err) {
        console.error(`Erro página ${pagina}`)
        return []
      }
    })

    const responses = await Promise.all(batch)
    todos.push(...responses.flat())
  }

  console.log('📦 TOTAL BRUTO:', todos.length)

  const produtos: Produto[] = []
  const ids = new Set<string>()

  for (const p of todos) {
    if (p?.ativo !== 'S') continue

    const preco = Number(p?.vlrProduto)
    if (!preco || preco <= 0) continue

    const departamento = String(p?.departamento || '').toUpperCase()

    const ehAlimento = DEPS_ALIMENTOS.some((dep) =>
      departamento.includes(dep)
    )

    if (!ehAlimento) continue

    const id =
      String(p?.plu || p?.codigoBarra || p?.id) ||
      `${Date.now()}-${Math.random()}`

    if (ids.has(id)) continue
    ids.add(id)

    produtos.push({
      id,
      nome: p?.nome?.trim() || 'Produto sem nome',
      preço2: preco.toFixed(2),
      tipo:
        p?.subcategoria?.replace(/^\d+\s/, '').trim() ||
        p?.categoria?.trim() ||
        p?.departamento?.trim() ||
        'Alimentos',
      img: p?.imageUrl || p?.imagem || '',
      quantidade: 1
    })
  }

  console.log('✅ TOTAL FINAL:', produtos.length)

  produtosCache = {
    data: produtos,
    timestamp: Date.now()
  }

  return produtos
}

// ================= API =================

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const pagina = Number(query.pagina || 1)
    const busca = String(query.busca || '').toLowerCase()

    const token = await getToken()
    let produtos = await buscarTodosProdutos(token)

    if (busca) {
      produtos = produtos.filter((p) =>
        p.nome.toLowerCase().includes(busca)
      )
    }

    const inicio = (pagina - 1) * POR_PAGINA
    const fim = inicio + POR_PAGINA

    setHeader(event, 'Cache-Control', 'public, max-age=300')

    return {
      produtos: produtos.slice(inicio, fim),
      pagina,
      total: produtos.length,
      totalPaginas: Math.ceil(produtos.length / POR_PAGINA),
      temMais: fim < produtos.length
    }
  } catch (err: any) {
    console.error('ERRO API REAL:', err)

    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Erro interno'
    })
  }
})