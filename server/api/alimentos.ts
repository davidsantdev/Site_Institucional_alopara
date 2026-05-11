// server/api/alimentos.ts

// ================= TIPOS =================
export const runtime = 'nodejs'
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

// CACHE
const CACHE_DURATION = 1000 * 60 * 30 // 30min

// PAGINAÇÃO
const POR_PAGINA = 48

// IMPORTANTE:
// NA VERCEL NÃO EXAGERE
const MAX_PAGINAS_API = 5
const BATCH_SIZE = 1

// TIMEOUT
const REQUEST_TIMEOUT = 15000

// URLS
const AUTH_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token'

const PRODUTOS_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado'

// ================= DEPARTAMENTOS =================

const DEPS_ALIMENTOS = new Set([
  'MERCEARIA',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',
  'BOMBONIERE',
  'MATINAIS',
])

// ================= CACHE =================

let tokenCache: {
  token: string
  expires: number
} | null = null

let produtosCache: CacheProdutos | null = null

// ================= TOKEN =================

async function getToken(): Promise<string> {
  try {
    // CACHE TOKEN
    if (tokenCache && Date.now() < tokenCache.expires) {
      console.log('⚡ TOKEN CACHE HIT')
      return tokenCache.token
    }

    // IMPORTANTE:
    // Buffer pode quebrar na Vercel
    const credentials = btoa('cisspoder-oauth:poder7547')

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, REQUEST_TIMEOUT)

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
      signal: controller.signal,
    })

    clearTimeout(timeout)

    // LOG REAL DO ERRO
    if (!res.ok) {
      const erro = await res.text()

      console.error('❌ ERRO TOKEN:', {
        status: res.status,
        erro,
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao autenticar API externa',
      })
    }

    const data = await res.json()

    if (!data?.access_token) {
      console.error('❌ TOKEN INVÁLIDO:', data)

      throw createError({
        statusCode: 500,
        statusMessage: 'Token inválido',
      })
    }

    tokenCache = {
      token: data.access_token,
      expires: Date.now() + 55 * 60 * 1000,
    }

    console.log('✅ TOKEN GERADO')

    return data.access_token
  } catch (err) {
    console.error('❌ FALHA GET TOKEN:', err)
    throw err
  }
}

// ================= FETCH PÁGINA =================

async function fetchPagina(
  pagina: number,
  headers: Record<string, string>
): Promise<any[]> {
  try {
    console.log(`📄 BUSCANDO PÁGINA ${pagina}`)

    const controller = new AbortController()

    const timeout = setTimeout(() => {
      controller.abort()
    }, REQUEST_TIMEOUT)

    const res = await fetch(PRODUTOS_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        idLoja: '0001',
        page: pagina,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    // LOG DETALHADO
    if (!res.ok) {
      const erro = await res.text()

      console.error(`❌ ERRO PÁGINA ${pagina}:`, {
        status: res.status,
        erro,
      })

      return []
    }

    const json = await res.json()

    console.log(`✅ PÁGINA ${pagina} OK`)

    // FORMATO 1
    if (Array.isArray(json)) {
      return json
    }

    // FORMATO 2
    if (Array.isArray(json?.data)) {
      return json.data
    }

    // FORMATO 3
    if (Array.isArray(json?.produtos)) {
      return json.produtos
    }

    console.warn(`⚠️ FORMATO DESCONHECIDO PÁGINA ${pagina}`)

    return []
  } catch (err: any) {
    console.error(`❌ ERRO FETCH PÁGINA ${pagina}:`, err?.message || err)

    return []
  }
}

// ================= BUSCAR PRODUTOS =================

async function buscarTodosProdutos(
  token: string
): Promise<Produto[]> {
  try {
    // CACHE
    if (
      produtosCache &&
      Date.now() - produtosCache.timestamp < CACHE_DURATION
    ) {
      console.log(
        `⚡ CACHE PRODUTOS HIT: ${produtosCache.total}`
      )

      return produtosCache.data
    }

    console.log('🔄 BUSCANDO PRODUTOS...')

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const todasRespostas: any[][] = []

    // BUSCA CONTROLADA
    for (let pagina = 1; pagina <= MAX_PAGINAS_API; pagina++) {
      const resposta = await fetchPagina(pagina, headers)

      // PARAR SE VAZIO
      if (!resposta.length) {
        console.log(`🏁 FIM NA PÁGINA ${pagina}`)
        break
      }

      todasRespostas.push(resposta)

      console.log(
        `📦 Página ${pagina}: ${resposta.length} produtos`
      )

      // IMPORTANTE:
      // evita flood na API
      await new Promise((resolve) =>
        setTimeout(resolve, 300)
      )
    }

    const todos = todasRespostas.flat()

    console.log(`📦 TOTAL BRUTO: ${todos.length}`)

    const ids = new Map<string, Produto>()

    for (const p of todos) {
      try {
        // SOMENTE ATIVOS
        if (p.ativo !== 'S') continue

        const preco = Number(p.vlrProduto)

        // PREÇO INVÁLIDO
        if (!preco || preco <= 0) continue

        const departamento = String(
          p.departamento || ''
        ).toUpperCase()

        const ehAlimento =
          DEPS_ALIMENTOS.has(departamento) ||
          [...DEPS_ALIMENTOS].some((d) =>
            departamento.includes(d)
          )

        if (!ehAlimento) continue

        const id = String(
          p.plu ||
            p.codigoBarra ||
            p.id ||
            ''
        )

        if (!id) continue

        // EVITA DUPLICADOS
        if (!ids.has(id)) {
          ids.set(id, {
            id,

            nome:
              p.nome?.trim() ||
              'Produto sem nome',

            preco,

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

            quantidade: 1,
          })
        }
      } catch (err) {
        console.error(
          '❌ ERRO PROCESSANDO PRODUTO:',
          err
        )
      }
    }

    const produtos = Array.from(ids.values())

    // ORDENA
    produtos.sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR')
    )

    console.log(
      `✅ TOTAL FINAL: ${produtos.length}`
    )

    // CACHE
    produtosCache = {
      data: produtos,
      timestamp: Date.now(),
      total: produtos.length,
    }

    return produtos
  } catch (err) {
    console.error('❌ ERRO BUSCAR PRODUTOS:', err)
    throw err
  }
}

// ================= HANDLER =================

export default defineEventHandler(async (event) => {
  try {
    console.log('🚀 REQUEST /api/alimentos')

    const query = getQuery(event)

    const pagina = Math.max(
      1,
      Number(query.pagina || 1)
    )

    const busca = String(
      query.busca || ''
    )
      .toLowerCase()
      .trim()

    const tipo = String(
      query.tipo || ''
    ).trim()

    console.log({
      pagina,
      busca,
      tipo,
    })

    // TOKEN
    const token = await getToken()

    // PRODUTOS
    let produtos = await buscarTodosProdutos(
      token
    )

    // BUSCA
    if (busca) {
      const termos = busca
        .split(/\s+/)
        .filter(Boolean)

      produtos = produtos.filter((p) => {
        const nome = p.nome.toLowerCase()

        return termos.every((t) =>
          nome.includes(t)
        )
      })

      console.log(
        `🔎 RESULTADO BUSCA: ${produtos.length}`
      )
    }

    // TIPO
    if (tipo) {
      produtos = produtos.filter((p) =>
        p.tipo
          .toLowerCase()
          .includes(tipo.toLowerCase())
      )

      console.log(
        `🏷️ RESULTADO TIPO: ${produtos.length}`
      )
    }

    // PAGINAÇÃO
    const inicio = (pagina - 1) * POR_PAGINA

    const fim = inicio + POR_PAGINA

    const paginados = produtos.slice(
      inicio,
      fim
    )

    // CACHE HEADERS
    setHeaders(event, {
      'Cache-Control':
        'public, max-age=300, stale-while-revalidate=3600',

      'X-Total-Produtos': String(
        produtos.length
      ),
    })

    console.log(
      `✅ RETORNANDO ${paginados.length} PRODUTOS`
    )

    return {
      produtos: paginados,

      pagina,

      total: produtos.length,

      totalPaginas: Math.ceil(
        produtos.length / POR_PAGINA
      ),

      temMais: fim < produtos.length,
    }
  } catch (err: any) {
    console.error('❌ ERRO GERAL API:', err)

    setResponseStatus(event, 500)

    return {
      erro: true,

      mensagem:
        err?.message ||
        'Erro interno servidor',

      produtos: [],

      pagina: 1,

      total: 0,

      totalPaginas: 0,

      temMais: false,
    }
  }
})