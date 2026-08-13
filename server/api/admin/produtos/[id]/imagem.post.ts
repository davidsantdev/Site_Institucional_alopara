import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, defineEventHandler, getRouterParam, readMultipartFormData } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverrideImagem, UPLOADS_DIR } from '../../../../utils/catalogo'

const TIPOS_ACEITOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const TAMANHO_MAX = 5 * 1024 * 1024 // 5MB — foto de produto não precisa de mais que isso

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find(p => p.name === 'imagem')
  if (!arquivo?.data)
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })

  const ext = TIPOS_ACEITOS[arquivo.type ?? '']
  if (!ext)
    throw createError({ statusCode: 415, statusMessage: 'Formato não aceito — use JPG, PNG ou WEBP' })
  if (arquivo.data.length > TAMANHO_MAX)
    throw createError({ statusCode: 413, statusMessage: 'Arquivo maior que 5MB' })

  await mkdir(UPLOADS_DIR, { recursive: true })

  // ID vira nome de arquivo — sanitizado pra nunca escapar da pasta de uploads.
  const idSeguro = produtoId.replace(/[^\w-]/g, '_')

  // Remove qualquer versão anterior (mesmo com outra extensão) antes de salvar a nova,
  // pra nunca acumular lixo em disco quando o admin troca a foto várias vezes.
  const existentes = await readdir(UPLOADS_DIR).catch(() => [])
  await Promise.all(
    existentes
      .filter(f => f.startsWith(`${idSeguro}.`))
      .map(f => rm(join(UPLOADS_DIR, f)).catch(() => {})),
  )

  const nomeArquivo = `${idSeguro}.${ext}`
  await writeFile(join(UPLOADS_DIR, nomeArquivo), arquivo.data)

  // Nome de arquivo é estável (some/reaparece igual se reenviado) — o `?v=`
  // é só pra não ficar preso em cache do navegador mostrando a foto antiga.
  const url = `/uploads/${nomeArquivo}?v=${Date.now()}`
  await definirOverrideImagem(produtoId, url)

  return { ok: true, imagem: url }
})
