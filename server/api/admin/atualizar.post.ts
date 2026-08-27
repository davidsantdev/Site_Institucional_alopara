import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { forcarNovaVarredura } from '../../utils/catalogo'

/**
 * Botão "Atualizar agora" do painel: dispara uma varredura nova sem esperar
 * o TTL de 6h. Não espera terminar — a varredura roda em segundo plano
 * (pode levar alguns minutos, com ~14 mil imagens pra validar no CDN).
 */
export default defineEventHandler((event) => {
  exigirAdmin(event)
  return forcarNovaVarredura()
})
