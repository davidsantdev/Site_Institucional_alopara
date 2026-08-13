import { readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { exigirAdmin } from '../../../../utils/adminAuth'
import { definirOverrideImagem, UPLOADS_DIR } from '../../../../utils/catalogo'

/** Remove a foto escolhida à mão — o produto volta a usar CDN/Cosmos automaticamente. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const produtoId = getRouterParam(event, 'id')
  if (!produtoId)
    throw createError({ statusCode: 400, statusMessage: 'ID do produto ausente' })

  const idSeguro = produtoId.replace(/[^\w-]/g, '_')
  const existentes = await readdir(UPLOADS_DIR).catch(() => [])
  await Promise.all(
    existentes
      .filter(f => f.startsWith(`${idSeguro}.`))
      .map(f => rm(join(UPLOADS_DIR, f)).catch(() => {})),
  )

  await definirOverrideImagem(produtoId, '')
  return { ok: true }
})
