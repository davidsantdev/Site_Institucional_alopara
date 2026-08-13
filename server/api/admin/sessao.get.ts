import { defineEventHandler } from 'h3'
import { estaAutenticado } from '../../utils/adminAuth'

/** A página do painel usa isto pra decidir se mostra o login ou o editor. */
export default defineEventHandler((event) => {
  return { autenticado: estaAutenticado(event) }
})
