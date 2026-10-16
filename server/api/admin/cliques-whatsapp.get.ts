import { defineEventHandler } from 'h3'
import { exigirAdmin } from '../../utils/adminAuth'
import { obterResumoCliquesWhatsapp } from '../../utils/cliquesWhatsapp'

export default defineEventHandler(async (event) => {
  exigirAdmin(event)
  return obterResumoCliquesWhatsapp()
})
