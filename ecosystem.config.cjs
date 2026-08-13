// Config do pm2 pra rodar o servidor de produção.
//
// Por que isto existe: `node .output/server/index.mjs` NÃO lê .env sozinho
// (o build do Nitro não embala dotenv), e um `pm2 restart <nome>` comum não
// relê nada — ele só reusa o env que o pm2 capturou lá no `pm2 start`
// original. Resultado: editar o .env e reiniciar não tinha efeito nenhum
// (foi exatamente isso que deixou a senha do admin travada em produção).
//
// Este arquivo resolve isso lendo o .env de novo toda vez que o pm2 carrega
// esta config. Pra pegar um .env editado, reinicia SEMPRE apontando pro
// arquivo (não só pelo nome do processo):
//
//   pm2 restart ecosystem.config.cjs --update-env
//
// Primeira vez rodando com este arquivo (troca o processo antigo por este):
//
//   pm2 delete alopara        # ou o nome que o processo antigo tiver hoje
//   pm2 start ecosystem.config.cjs
//   pm2 save

const fs = require('node:fs')
const path = require('node:path')

function lerEnv(caminho) {
  const env = {}
  if (!fs.existsSync(caminho))
    return env
  for (const linha of fs.readFileSync(caminho, 'utf8').split('\n')) {
    const l = linha.trim()
    if (!l || l.startsWith('#'))
      continue
    const i = l.indexOf('=')
    if (i === -1)
      continue
    env[l.slice(0, i).trim()] = l.slice(i + 1).trim()
  }
  return env
}

module.exports = {
  apps: [
    {
      name: 'alopara',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        ...lerEnv(path.join(__dirname, '.env')),
      },
    },
  ],
}
