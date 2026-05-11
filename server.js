import express from 'express'
import axios from 'axios'

const app = express()
const PORT = 3000

let TOKEN = null
let TOKEN_EXPIRA = 0

async function getToken() {
  const agora = Date.now()

  if (TOKEN && agora < TOKEN_EXPIRA) {
    return TOKEN
  }

  console.log('🔄 Gerando novo token...')

  const response = await axios.post('http://localhost:4664/api/v1/auth/token', {
    // COLOCA SEU LOGIN AQUI
    username: 'SEU_USUARIO',
    password: 'SUA_SENHA'
  })

  TOKEN = response.data.access_token

  // 24 horas
  TOKEN_EXPIRA = agora + (24 * 60 * 60 * 1000)

  return TOKEN
}

app.get('/api/alimentos', async (req, res) => {
  try {
    const token = await getToken()

    const response = await axios.get('http://localhost:4664/api/v1/produtos', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    res.json(response.data)

  } catch (error) {
    console.error('❌ ERRO:', error.response?.data || error.message)

    res.status(500).json({
      erro: 'Erro ao buscar produtos'
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`)
})