import { defineEventHandler } from 'h3'
import { logout } from '../../utils/adminAuth'

export default defineEventHandler((event) => {
  logout(event)
  return { ok: true }
})
