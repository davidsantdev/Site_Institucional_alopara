import { defineEventHandler, readBody } from 'h3'
import { login } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  login(event, String(body?.senha ?? ''))
  return { ok: true }
})
