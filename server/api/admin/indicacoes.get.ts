import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { listarIndicacoes } from '../../utils/afiliados'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)
  const indicacoes = await listarIndicacoes()
  return { indicacoes }
})
