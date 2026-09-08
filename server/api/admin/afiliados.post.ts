import { createError, defineEventHandler, readBody } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { criarAfiliado } from '../../utils/afiliados'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)

  const body = await readBody<{ nome?: string, codigo?: string, percentual?: number, telefone?: string }>(event)

  try {
    const afiliado = await criarAfiliado(
      body?.nome ?? '',
      body?.codigo ?? '',
      Number(body?.percentual),
      body?.telefone,
    )
    return { ok: true, afiliado }
  }
  catch (e: any) {
    throw createError({ statusCode: 400, statusMessage: e?.message || 'Erro ao criar afiliado' })
  }
})
