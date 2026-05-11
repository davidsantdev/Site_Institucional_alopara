// server/api/alimentos.ts


type Produto = {
  id: string
  nome: string
  preco: number
  preço2: string
  tipo: string
  img: string
  quantidade: number
}

const AUTH_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token'

const PRODUTOS_URL =
  'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado'

const DEPS_ALIMENTOS = new Set([
  'MERCEARIA',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',
  'BOMBONIERE',
  'MATINAIS',
])

let tokenCache: {
  token: string
  expires: number
} | null = null

async function getToken(): Promise<string> {
  if (
    tokenCache &&
    Date.now() < tokenCache.expires
  ) {
    return tokenCache.token
  }

const credentials = btoa(
  'cisspoder-oauth:poder7547'
)

  const res = await fetch(AUTH_URL, {
    method: 'POST',

    headers: {
      'Content-Type':
        'application/x-www-form-urlencoded',

      Authorization: `Basic ${credentials}`,
    },

    body: new URLSearchParams({
      grant_type: 'password',
      username: 'EXECUTOR',
      password: 'ex1234',
    }),
  })

  if (!res.ok) {
    const erro = await res.text()

    console.error('ERRO TOKEN:', erro)

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro token',
    })
  }

  const data = await res.json()

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return data.access_token
}

async function buscarPagina(
  pagina: number,
  token: string
) {
  const res = await fetch(PRODUTOS_URL, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      idLoja: '0001',
      page: pagina,
    }),
  })

  if (!res.ok) {
    const erro = await res.text()

    console.error(
      `ERRO PAGINA ${pagina}:`,
      erro
    )

    return []
  }

  const json = await res.json()

  if (Array.isArray(json)) return json
  if (Array.isArray(json?.data))
    return json.data
  if (Array.isArray(json?.produtos))
    return json.produtos

  return []
}

function normalizar(
  produtos: any[]
): Produto[] {
  const ids = new Map<string, Produto>()

  for (const p of produtos) {
    if (p.ativo !== 'S') continue

    const preco = Number(p.vlrProduto)

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
  }

  return Array.from(ids.values())
}

export default defineEventHandler(
  async (event) => {
    try {
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

      const token = await getToken()

      // BUSCA SOMENTE UMA PÁGINA
      const apiProdutos =
        await buscarPagina(
          pagina,
          token
        )

      let produtos =
        normalizar(apiProdutos)

      // BUSCA
      if (busca) {
        const termos = busca
          .split(/\s+/)
          .filter(Boolean)

        produtos = produtos.filter((p) => {
          const nome =
            p.nome.toLowerCase()

          return termos.every((t) =>
            nome.includes(t)
          )
        })
      }

      // FILTRO TIPO
      if (tipo) {
        produtos = produtos.filter((p) =>
          p.tipo
            .toLowerCase()
            .includes(tipo.toLowerCase())
        )
      }

      return {
        produtos,

        pagina,

        total: produtos.length,

        totalPaginas: pagina + 1,

        temMais:
          apiProdutos.length > 0,
      }
    } catch (err) {
      console.error(err)

      setResponseStatus(event, 500)

      return {
        produtos: [],
        pagina: 1,
        total: 0,
        totalPaginas: 0,
        temMais: false,
      }
    }
  }
)