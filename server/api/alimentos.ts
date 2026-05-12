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

let produtosCache: CacheProdutos | null =
  null

const CACHE_DURATION =
  1000 * 60 * 60 // 1h

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
  if (
    tokenCache &&
    Date.now() < tokenCache.expires
  ) {
    return tokenCache.token
  }

  const credentials = Buffer.from(
    'cisspoder-oauth:poder7547'
  ).toString('base64')

  const res = await fetch(
    'https://aloparacim.dataciss.com.br:443/cisspoder-auth/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: 'EXECUTOR',
        password: 'ex1234'
      })
    }
  )

  const data = await res.json()

  tokenCache = {
    token: data.access_token,
    expires:
      Date.now() + 55 * 60 * 1000
  }

  return data.access_token
}

// ================= BUSCAR PRODUTOS =================

async function buscarTodosProdutos(
  token: string
) {
  // cache RAM
  if (
    produtosCache &&
    Date.now() -
      produtosCache.timestamp <
      CACHE_DURATION
  ) {
    console.log(
      '⚡ CACHE:',
      produtosCache.data.length
    )

    return produtosCache.data
  }

  console.log(
    '🔄 BUSCANDO PAGINAS API...'
  )

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  // busca páginas em paralelo
  const requests = Array.from(
    { length: MAX_PAGINAS_API },
    async (_, i) => {
      const pagina = i + 1

      try {
        const res = await fetch(
          'https://aloparacim.dataciss.com.br/cisspoder-service/get_produtos_sitemercado',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              idLoja: '0001',
              page: pagina
            })
          }
        )

        const json = await res.json()

        return Array.isArray(json)
          ? json
          : json?.data ?? []
      } catch (err) {
        console.error(
          `Erro página ${pagina}`
        )

        return []
      }
    }
  )

  const responses = await Promise.all(
    requests
  )

  const todos = responses.flat()

  console.log(
    '📦 TOTAL BRUTO:',
    todos.length
  )

  const produtos: Produto[] = []

  const ids = new Set<string>()

  for (const p of todos) {
    // ativo
    if (p.ativo !== 'S') continue

    // preço válido
    const preco = Number(p.vlrProduto)

    if (!preco || preco <= 0)
      continue

    // departamento
    const departamento = String(
      p.departamento || ''
    ).toUpperCase()

    const ehAlimento =
      DEPS_ALIMENTOS.some((dep) =>
        departamento.includes(dep)
      )

    if (!ehAlimento) continue

    // id único
    const id = String(
      p.plu ||
        p.codigoBarra ||
        p.id ||
        crypto.randomUUID()
    )

    // evita repetidos
    if (ids.has(id)) continue

    ids.add(id)

    produtos.push({
      id,

      nome:
        p.nome?.trim() ||
        'Produto sem nome',

      preço2: preco.toFixed(2),

      tipo:
        p.subcategoria
          ?.replace(/^\d+\s/, '')
          ?.trim() ||
        p.categoria?.trim() ||
        p.departamento?.trim() ||
        'Alimentos',

      img:
        p.imageUrl ||
        p.imagem ||
        '',

      quantidade: 1
    })
  }

  console.log(
    '✅ TOTAL FINAL:',
    produtos.length
  )

  produtosCache = {
    data: produtos,
    timestamp: Date.now()
  }

  return produtos
}

// ================= API =================

export default defineEventHandler(
  async (event) => {
    try {
      const query = getQuery(event)

      const pagina = Number(
        query.pagina || 1
      )

      const busca = String(
        query.busca || ''
      ).toLowerCase()

      const token = await getToken()

      let produtos =
        await buscarTodosProdutos(token)

      // busca global
      if (busca) {
        produtos = produtos.filter((p) =>
          p.nome
            .toLowerCase()
            .includes(busca)
        )
      }

      // paginação frontend
      const inicio =
        (pagina - 1) * POR_PAGINA

      const fim =
        inicio + POR_PAGINA

      const paginados =
        produtos.slice(inicio, fim)

      setHeader(
        event,
        'Cache-Control',
        'public, max-age=300'
      )

      return {
        produtos: paginados,
        pagina,
        total: produtos.length,
        totalPaginas: Math.ceil(
          produtos.length /
            POR_PAGINA
        ),
        temMais:
          fim < produtos.length
      }
    } catch (err) {
      console.error(
        'ERRO API:',
        err
      )

      return {
        produtos: [],
        pagina: 1,
        total: 0,
        totalPaginas: 0,
        temMais: false
      }
    }
  }
)