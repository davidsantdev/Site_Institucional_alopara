import { createError, defineEventHandler, getRouterParam, readMultipartFormData } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { salvarImagemProduto, TAMANHO_MAX_IMAGEM, TIPOS_IMAGEM_ACEITOS } from '../../../../utils/imagemProduto'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find(p => p.name === 'imagem')
  if (!arquivo?.data)
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })

  const ext = TIPOS_IMAGEM_ACEITOS[arquivo.type ?? '']
  if (!ext)
    throw createError({ statusCode: 415, statusMessage: 'Formato não aceito — use JPG, PNG ou WEBP' })
  if (arquivo.data.length > TAMANHO_MAX_IMAGEM)
    throw createError({ statusCode: 413, statusMessage: 'Arquivo maior que 5MB' })

  const imagem = await salvarImagemProduto(produtoId, arquivo.data, ext)
  return { ok: true, imagem }
})
