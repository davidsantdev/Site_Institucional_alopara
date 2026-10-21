import { createError, defineEventHandler, getQuery } from 'h3'
import { exigirAdmin } from '../../../utils/adminAuth'
import { buscarFotos } from '../../../utils/pexels'

/** Sugestões de foto pra um produto (banco do Pexels) — o admin escolhe uma. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const termo = String(getQuery(event).q ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
  if (!termo)
    throw createError({ statusCode: 400, statusMessage: 'Digite o que buscar' })

  return { fotos: await buscarFotos(termo) }
})
