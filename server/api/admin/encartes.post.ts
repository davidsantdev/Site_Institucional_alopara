import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { adicionarEncarte, ENCARTES_DIR } from '../../utils/encartes'

const TIPOS_ACEITOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
// Encarte é uma arte grande, cheia de produto e preço — precisa continuar legível ao dar zoom.
const TAMANHO_MAX = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const partes = await readMultipartFormData(event)
  const arquivo = partes?.find(p => p.name === 'arquivo')
  const titulo = partes?.find(p => p.name === 'titulo')?.data?.toString('utf-8') ?? ''

  if (!arquivo?.data)
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado' })

  const ext = TIPOS_ACEITOS[arquivo.type ?? '']
  if (!ext)
    throw createError({ statusCode: 415, statusMessage: 'Formato não aceito — use JPG, PNG ou WEBP' })
  if (arquivo.data.length > TAMANHO_MAX)
    throw createError({ statusCode: 413, statusMessage: 'Arquivo maior que 10MB' })

  await mkdir(ENCARTES_DIR, { recursive: true })

  // Nome único por upload — nunca colide, então o cache longo da rota de
  // uploads (immutable) é seguro sem precisar de `?v=` como na foto de produto.
  const nomeArquivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  await writeFile(join(ENCARTES_DIR, nomeArquivo), arquivo.data)

  const encarte = await adicionarEncarte(titulo, nomeArquivo)
  return { ok: true, encarte }
})
