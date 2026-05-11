// server/api/alimentos.ts

export const runtime = 'nodejs'

import axios from 'axios'

// ================= CONFIG =================

// 🔥 AGORA USANDO SEU IP PÚBLICO
const BASE_URL = 'http://168.121.105.138:4664'

const AUTH_URL = `${BASE_URL}/cisspoder-auth/oauth/token`
const PRODUTOS_URL = `${BASE_URL}/cisspoder-service/get_produtos_sitemercado`

const DEPS_ALIMENTOS = new Set([
  'MERCEARIA',
  'FRIOS',
  'LATICINIOS',
  'CONGELADOS',
  'BOMBONIERE',
  'MATINAIS',
])

// ================= TYPES =================

type Produto = {
  id: string
  nome: string
  preco: number
  preco2: string
  tipo: string
  img: string
  quantidade: number
}

// ================= TOKEN CACHE =================

let tokenCache: {
  token: string
  expires: number
} | null = null

// ================= TOKEN =================

async function getToken(): Promise<string> {
  try {
    if (tokenCache && Date.now() < tokenCache.expires) {
      return tokenCache.token
    }

    const credentials = Buffer.from(
      'cisspoder-oauth:poder7547'
    ).toString('base64')

    const params = new URLSearchParams({
      grant_type: 'password',
      username: 'EXECUTOR',
      password: 'ex1234',
    })

    const res = await axios.post(AUTH_URL, params.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 20000,
    })

    const data = res.data

    if (!data?.access_token) {
      throw new Error('Token inválido')
    }

    tokenCache = {
      token: data.access_token,
      expires: Date.now() + 55 * 60 * 1000,
    }

    return data.access_token
  } catch (error: any) {
    console.error('❌ ERRO AO GERAR TOKEN:', error?.response?.data || error)
    throw error
  }
}

// ================= NORMALIZAR =================

function normalizarProdutos(produtos: any[]): Produto[] {
  const ids = new Map<string, Produto>()

  for (const p of produtos) {
    try {
      if (p.ativo !== 'S') continue

      const preco = Number(p.vlrProduto)
      if (!preco || preco <= 0) continue

      const departamento = String(p.departamento || '').toUpperCase()

      const ehAlimento =
        DEPS_ALIMENTOS.has(departamento) ||
        [...DEPS_ALIMENTOS].some((d) => departamento.includes(d))

      if (!ehAlimento) continue

      const id = String(p.plu || p.codigoBarra || p.id || '')
      if (!id) continue

      if (!ids.has(id)) {
        ids.set(id, {
          id,
          nome: p.nome?.trim() || 'Produto sem nome',
          preco,
          preco2: preco.toFixed(2),
          tipo:
            p.subcategoria?.replace(/^\d+\s/, '')?.trim() ||
            p.categoria?.trim() ||
            p.departamento?.trim() ||
            'Alimentos',
          img: p.imageUrl || p.imagem || '',
          quantidade: 1,
        })
      }
    } catch (err) {
      console.error('❌ ERRO NORMALIZANDO:', err)
    }
  }

  return Array.from(ids.values())
}

// ================= HANDLER =================

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    const pagina = Number(query.pagina || 1)
    const busca = String(query.busca || '')
    const tipo = String(query.tipo || '')

    const token = await getToken()

    const res = await axios.post(
      PRODUTOS_URL,
      {
        idLoja: '0001',
        page: pagina,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 25000,
      }
    )

    const json = res.data

    let apiProdutos: any[] = []

    if (Array.isArray(json)) {
      apiProdutos = json
    } else if (Array.isArray(json?.data)) {
      apiProdutos = json.data
    } else if (Array.isArray(json?.produtos)) {
      apiProdutos = json.produtos
    }

    let produtos = normalizarProdutos(apiProdutos)

    // ================= BUSCA =================

    if (busca) {
      const termos = busca
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)

      produtos = produtos.filter((p) => {
        const nome = p.nome.toLowerCase()
        return termos.every((t) => nome.includes(t))
      })
    }

    // ================= FILTRO =================

    if (tipo) {
      produtos = produtos.filter((p) =>
        p.tipo.toLowerCase().includes(tipo.toLowerCase())
      )
    }

    return {
      produtos,
      pagina,
      total: produtos.length,
      totalPaginas: pagina + 1,
      temMais: apiProdutos.length > 0,
    }
  } catch (err: any) {
    console.error('❌ ERRO API:', err?.response?.data || err)

    setResponseStatus(event, 500)

    return {
      erro: true,
      mensagem: err?.message || 'Erro ao carregar produtos',
      produtos: [],
      pagina: 1,
      total: 0,
      totalPaginas: 0,
      temMais: false,
    }
  }
})