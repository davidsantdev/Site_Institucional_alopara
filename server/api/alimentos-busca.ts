let tokenCache: { token: string; expires: number } | null = null

const MAX_PAGINAS = 30
const PAGINAS_POR_LOTE = 5

const DEPS_ALIMENTOS = [
  'MERCEARIA',

  'HORTIFRUTI',
  'PADARIA',

  'PAS',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',

  'BOMBONIERE',
  'MATINAIS'
]

async function getToken() {
  if (tokenCache && Date.now() < tokenCache.expires) {
    return tokenCache.token
  }

  const credentials = Buffer.from(
    'cisspoder-oauth:poder7547'
  ).toString('base64')

  const res = await fetch(
    'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token',
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
      })
    }
  )

  const data = await res.json()

  tokenCache = {
    token: data.access_token,
    expires: Date.now() + 55 * 60 * 1000
  }

  return data.access_token
}

function transformarProduto(p: any) {
  if (p.ativo !== 'S') return null

  const preco = Number(p.vlrProduto)

  if (!preco || preco <= 0) return null

  const departamento = String(
    p.departamento || ''
  ).toUpperCase()

  const ehAlimento = DEPS_ALIMENTOS.some((d) =>
    departamento.includes(d)
  )

  if (!ehAlimento) return null

  return {
    id: String(
      p.plu ||
      p.codigoBarra ||
      crypto.randomUUID()
    ),

    nome:
      p.nome?.trim() ||
      'Produto sem nome',

    preço2: preco.toFixed(2),

    tipo:
      p.subcategoria
        ?.replace(/^\d+\s/, '')
        ?.trim() ||

      p.categoria?.trim() ||

      'Alimentos',

    img:
      p.imageUrl ||
      p.imagem ||
      '',

    quantidade: 1
  }
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const busca = String(
      query.busca || ''
    )
      .toLowerCase()
      .trim()

    if (!busca) {
      return {
        produtos: []
      }
    }

    const token = await getToken()

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }

    const encontrados: any[] = []
    const ids = new Set<string>()

    // busca em LOTES
    for (
      let inicio = 1;
      inicio <= MAX_PAGINAS;
      inicio += PAGINAS_POR_LOTE
    ) {
      const paginas = Array.from(
        { length: PAGINAS_POR_LOTE },
        (_, i) => inicio + i
      )

      const requests = paginas.map((pagina) =>
        fetch(
          'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado',
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              idLoja: '0001',
              page: pagina,
              itensPorPagina: 100
            })
          }
        )
          .then((r) => r.json())
          .catch(() => null)
      )

      const responses = await Promise.all(
        requests
      )

      for (const response of responses) {
        const items: any[] = Array.isArray(response)
          ? response
          : response?.data ?? []

        for (const p of items) {
          const produto =
            transformarProduto(p)

          if (!produto) continue

          if (
            !produto.nome
              .toLowerCase()
              .includes(busca)
          ) {
            continue
          }

          if (ids.has(produto.id)) continue

          ids.add(produto.id)

          encontrados.push(produto)
        }
      }
    }

    return {
      produtos: encontrados
    }

  } catch (err) {
    console.error(err)

    return {
      produtos: []
    }
  }
})