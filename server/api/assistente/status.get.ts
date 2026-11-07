import { defineEventHandler, setHeader } from 'h3'
import { iaConfigurada } from '../../utils/assistente/ia'

/** O botão do assistente só aparece no site quando a IA está configurada no servidor. */
export default defineEventHandler((event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return { ativo: iaConfigurada() }
})
