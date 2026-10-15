import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { listarRespostasPesquisa } from '../../utils/pesquisaSatisfacao'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)
  const respostas = await listarRespostasPesquisa()
  return { respostas }
})
