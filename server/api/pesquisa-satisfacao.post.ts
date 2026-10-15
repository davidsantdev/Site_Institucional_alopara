/**
 * Recebe o envio da pesquisa interna de satisfação (ver
 * app/pages/pesquisa-satisfacao.vue). Rota pública de propósito — quem
 * preenche é colaborador, não tem (e não deve precisar de) login no site.
 */
import { createError, defineEventHandler, readBody } from 'h3'
import { registrarRespostaPesquisa } from '../utils/pesquisaSatisfacao'

const TAMANHO_MAXIMO_RESPOSTA = 4000

interface CorpoEsperado {
  nome?: string
  setor?: string
  tempoEmpresa?: string
  data?: string
  declaracao?: boolean
  respostas?: Record<string, string>
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CorpoEsperado>(event)

  if (!body?.declaracao)
    throw createError({ statusCode: 400, statusMessage: 'Confirme a declaração final antes de enviar.' })
  if (!body.setor?.trim())
    throw createError({ statusCode: 400, statusMessage: 'Informe o setor.' })
  if (!body.data?.trim())
    throw createError({ statusCode: 400, statusMessage: 'Informe a data.' })
  if (!body.respostas || typeof body.respostas !== 'object' || Array.isArray(body.respostas))
    throw createError({ statusCode: 400, statusMessage: 'Respostas ausentes.' })

  // Garante que cada resposta é de fato uma string curta antes de gravar —
  // o formulário já faz isso, mas o endpoint não confia só no cliente.
  const respostas: Record<string, string> = {}
  for (const [chave, valor] of Object.entries(body.respostas)) {
    if (typeof valor !== 'string' || !valor.trim())
      continue
    respostas[chave] = valor.trim().slice(0, TAMANHO_MAXIMO_RESPOSTA)
  }

  await registrarRespostaPesquisa({
    nome: body.nome,
    setor: body.setor,
    tempoEmpresa: body.tempoEmpresa,
    data: body.data,
    respostas,
  })

  return { ok: true }
})
