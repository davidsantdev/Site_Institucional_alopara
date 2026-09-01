/**
 * Ofertas reais do Clube Alô (Mercafácil) — "preço normal / preço do clube",
 * por EAN. A CISS só tem o campo `vlrPromocao` preenchido pra pouquíssimos
 * produtos (~44, testamos direto); a Mercafácil é quem roda o clube de
 * descontos de verdade e tem a lista completa (~145 no teste que fizemos).
 *
 * Só sabe fazer UMA coisa: buscar as ofertas ativas do tipo "general" (preço
 * de/por — os outros tipos, como takepay/cashback/pontos/combo, não cabem no
 * "preço do clube" que já existe no site e ficam de fora por enquanto).
 */
import process from 'node:process'

const MERCAFACIL_TOKEN = process.env.MERCAFACIL_TOKEN ?? ''
const MERCAFACIL_URL = 'https://api.mercafacil.com/v2/sales'
const TIMEOUT_MS = 15_000
/** Teto do plano deles (page_size máximo é 500) — cobre as ~145 de hoje com folga. */
const PAGE_SIZE = 500

export interface OfertaMercafacil {
  precoNormal: number
  precoOferta: number
}

/**
 * Busca as ofertas ativas e devolve um mapa EAN → preço normal/com desconto.
 * Nunca lança — sem token configurado, ou em qualquer erro, devolve vazio e
 * loga um aviso (a promoção da CISS continua valendo pros produtos que a
 * tiverem; isto aqui é um acréscimo, não uma dependência dura).
 */
export async function buscarOfertasMercafacil(): Promise<Map<string, OfertaMercafacil>> {
  const mapa = new Map<string, OfertaMercafacil>()
  if (!MERCAFACIL_TOKEN)
    return mapa

  try {
    const res = await fetch(`${MERCAFACIL_URL}?page=1&page_size=${PAGE_SIZE}&status=active`, {
      headers: {
        'Authorization': `Bearer ${MERCAFACIL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!res.ok) {
      console.warn(`[mercafacil] falha ao buscar ofertas: HTTP ${res.status}`)
      return mapa
    }

    const json: any = await res.json()
    const lista: any[] = Array.isArray(json?.data) ? json.data : []

    for (const oferta of lista) {
      if (oferta?.status !== 'active' || oferta?.type !== 'general' || !oferta.general_offer)
        continue

      const { ean, eans, price, discounted_price } = oferta.general_offer
      const precoNormal = Number(price)
      const precoOferta = Number(discounted_price)
      if (!(precoOferta > 0) || !(precoNormal > precoOferta))
        continue

      // Uma oferta pode valer para mais de um EAN (embalagens/variações do mesmo produto).
      const codigos: string[] = Array.isArray(eans) && eans.length ? eans : [ean]
      for (const codigo of codigos) {
        if (codigo)
          mapa.set(String(codigo), { precoNormal, precoOferta })
      }
    }

    const totalPaginas = json?.pagination?.total_pages ?? 1
    if (totalPaginas > 1) {
      // Não deve acontecer com PAGE_SIZE=500 no volume atual (~145) — se um dia passar
      // disso, a varredura só vê a 1ª página até isto virar um loop de paginação de verdade.
      console.warn(`[mercafacil] ${json.pagination.records} ofertas ativas passam de ${PAGE_SIZE} — só a 1ª página foi lida`)
    }

    // eslint-disable-next-line no-console -- mesmo padrão de log informativo do catálogo (ver catalogo.ts)
    console.log(`[mercafacil] ✅ ${mapa.size} produto(s) com oferta ativa`)
  }
  catch (err: any) {
    console.warn(`[mercafacil] erro ao buscar ofertas: ${err?.message ?? err}`)
  }

  return mapa
}
