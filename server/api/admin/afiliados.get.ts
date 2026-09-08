import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { listarAfiliados } from '../../utils/afiliados'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)
  const afiliados = await listarAfiliados()
  return { afiliados }
})
