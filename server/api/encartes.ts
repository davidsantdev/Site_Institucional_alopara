import { defineEventHandler } from 'h3'
import { listarEncartes } from '../utils/encartes'

/** Lista pública dos encartes — sem autenticação, é só pra exibir no site. */
export default defineEventHandler(async () => {
  const encartes = await listarEncartes()
  return { encartes }
})
