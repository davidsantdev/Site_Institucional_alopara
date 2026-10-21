import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { salvarImagemProduto, TAMANHO_MAX_IMAGEM, TIPOS_IMAGEM_ACEITOS } from '../../../../utils/imagemProduto'
import { urlImportacaoPexels } from '../../../../utils/pexels'

/** Baixa a foto do Pexels que o admin escolheu e guarda como foto do produto. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const body = await readBody<{ original?: string }>(event)
  const url = urlImportacaoPexels(String(body?.original ?? ''))
  if (!url)
    throw createError({ statusCode: 400, statusMessage: 'Endereço de foto inválido' })

  let resposta: Response
  try {
    resposta = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível baixar a foto agora' })
  }
  // Redirecionamento pra fora do Pexels: não segue (mesmo motivo de só aceitar o domínio deles).
  if (!resposta.ok || new URL(resposta.url).hostname !== 'images.pexels.com')
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível baixar a foto agora' })

  const ext = TIPOS_IMAGEM_ACEITOS[(resposta.headers.get('content-type') ?? '').split(';')[0]!.trim()]
  if (!ext)
    throw createError({ statusCode: 415, statusMessage: 'O Pexels devolveu um formato de imagem inesperado' })

  const dados = new Uint8Array(await resposta.arrayBuffer())
  if (dados.length > TAMANHO_MAX_IMAGEM)
    throw createError({ statusCode: 413, statusMessage: 'Foto maior que 5MB' })

  const imagem = await salvarImagemProduto(produtoId, dados, ext)
  return { ok: true, imagem }
})
