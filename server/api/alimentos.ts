export const runtime = 'nodejs'

import axios from 'axios'

// ================= CONFIG =================

// 🔥 Troca pela URL do Railway após deploy
const PROXY_URL = process.env.PROXY_URL || 'https://SEU-PROXY.up.railway.app'

const DEPS_ALIMENTOS = new Set([
  'MERCEARIA', 'FRIOS', 'LATICINIOS',
  'CONGELADOS', 'BOMBONIERE', 'MATINAIS',
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

    // 🔥 Chama o proxy no Railway
    const res = await axios.get(`${PROXY_URL}/produtos`, {
      params: { pagina },
      timeout: 30000,
    })

    const json = res.data
    let apiProdutos: any[] = []

    if (Array.isArray(json)) apiProdutos = json
    else if (Array.isArray(json?.data)) apiProdutos = json.data
    else if (Array.isArray(json?.produtos)) apiProdutos = json.produtos

    let produtos = normalizarProdutos(apiProdutos)

    if (busca) {
      const termos = busca.toLowerCase().split(/\s+/).filter(Boolean)
      produtos = produtos.filter((p) =>
        termos.every((t) => p.nome.toLowerCase().includes(t))
      )
    }

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