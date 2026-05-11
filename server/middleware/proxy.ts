import axios from 'axios'
import https from 'node:https'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

const AUTH_URL = 'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token'
const PRODUTOS_URL = 'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado'

let tokenCache: { token: string; expires: number } | null = null

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token

  const credentials = Buffer.from('cisspoder-oauth:poder7547').toString('base64')
  const params = new URLSearchParams({
    grant_type: 'password',
    username: 'EXECUTOR',
    password: 'ex1234',
  })

  const res = await axios.post(AUTH_URL, params.toString(), {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    httpsAgent,
    timeout: 30000,
  })

  tokenCache = {
    token: res.data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return tokenCache.token
}

export { getToken, PRODUTOS_URL, httpsAgent }