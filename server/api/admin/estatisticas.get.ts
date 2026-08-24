import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { obterEstatisticas } from '../../utils/catalogo'

/** Números do dashboard do painel — total de produtos, sem imagem, ocultos, etc. */
export default defineEventHandler(async (event) => {
  exigirAdmin(event)
  return obterEstatisticas()
})
