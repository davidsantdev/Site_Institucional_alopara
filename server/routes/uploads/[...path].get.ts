import { readFile } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { UPLOADS_DIR } from '../../utils/catalogo'

const TIPOS: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** Serve as fotos que o admin envia — fica fora de `public/`/`.output` de propósito (ver UPLOADS_DIR). */
export default defineEventHandler(async (event) => {
  const caminho = getRouterParam(event, 'path') ?? ''

  // Barra path traversal: normaliza e confere que o resultado continua dentro de UPLOADS_DIR.
  const alvo = normalize(join(UPLOADS_DIR, caminho))
  if (!alvo.startsWith(UPLOADS_DIR))
    throw createError({ statusCode: 400, statusMessage: 'Caminho inválido' })

  const ext = alvo.slice(alvo.lastIndexOf('.')).toLowerCase()
  const tipo = TIPOS[ext]
  if (!tipo)
    throw createError({ statusCode: 400, statusMessage: 'Tipo de arquivo não suportado' })

  try {
    const dados = await readFile(alvo)
    setHeader(event, 'Content-Type', tipo)
    // A URL sempre leva ?v=timestamp (ver rota de upload), então cache longo é seguro aqui.
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return dados
  }
  catch {
    throw createError({ statusCode: 404, statusMessage: 'Imagem não encontrada' })
  }
})
