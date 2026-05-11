import express from 'express'
import axios from 'axios'
import https from 'https'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

const AUTH_URL = 'https://aloparacim.dataciss.com.br:4665/cisspoder-auth/oauth/token'
const PRODUTOS_URL = 'https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado'

let tokenCache = null

async function getToken() {
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
    timeout: 15000,
  })

  tokenCache = {
    token: res.data.access_token,
    expires: Date.now() + 55 * 60 * 1000,
  }

  return tokenCache.token
}

app.get('/produtos', async (req, res) => {
  try {
    const token = await getToken()
    const { pagina = 1 } = req.query

    const response = await axios.post(
      PRODUTOS_URL,
      { idLoja: '0001', page: Number(pagina) },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        httpsAgent,
        timeout: 20000,
      }
    )

    res.json(response.data)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
})

app.listen(process.env.PORT || 3001, () => {
  console.log('Proxy rodando!')
})