/**
 * Autenticação do painel de admin — senha única (não é multiusuário), sessão
 * em memória. Não existe login em nenhum outro lugar do site de propósito
 * (menos superfície de ataque) — isto aqui é a única exceção, porque protege
 * escrita real no catálogo (a foto que todo mundo vê).
 */
import type { H3Event } from 'h3'
import { Buffer } from 'node:buffer'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import process from 'node:process'
import { createError, deleteCookie, getCookie, getRequestIP, setCookie } from 'h3'

const COOKIE_NOME = 'admin_session'
const SESSAO_TTL_MS = 7 * 24 * 60 * 60_000 // 7 dias

/** Sem senha configurada, o login fica permanentemente fechado — nunca aberto por acidente. */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

/** 5 tentativas erradas por IP a cada 15min — não impede um humano, impede força bruta automatizada. */
const MAX_TENTATIVAS = 5
const JANELA_TENTATIVAS_MS = 15 * 60_000

interface EstadoAuth {
  /** token → validade. */
  sessoes: Map<string, number>
  /** IP → tentativas malsucedidas recentes. */
  tentativas: Map<string, { contagem: number, desde: number }>
}

const CHAVE = Symbol.for('alopara.admin.auth')
const g = globalThis as any
const estado: EstadoAuth = g[CHAVE] ??= { sessoes: new Map(), tentativas: new Map() }

function senhaConfere(tentativa: string): boolean {
  if (!ADMIN_PASSWORD || !tentativa)
    return false
  const a = Buffer.from(tentativa)
  const b = Buffer.from(ADMIN_PASSWORD)
  // timingSafeEqual exige buffers do mesmo tamanho — sem isso, comparar senha
  // errada de tamanho diferente vazaria o tamanho da senha certa por timing.
  if (a.length !== b.length)
    return false
  return timingSafeEqual(a, b)
}

function limparSessoesExpiradas(): void {
  const agora = Date.now()
  for (const [token, validade] of estado.sessoes) {
    if (validade < agora)
      estado.sessoes.delete(token)
  }
}

/** `null` = pode tentar. Caso contrário, minutos restantes de bloqueio. */
function bloqueadoPorTentativas(ip: string): number | null {
  const t = estado.tentativas.get(ip)
  if (!t)
    return null
  if (Date.now() - t.desde > JANELA_TENTATIVAS_MS) {
    estado.tentativas.delete(ip)
    return null
  }
  if (t.contagem >= MAX_TENTATIVAS)
    return Math.ceil((JANELA_TENTATIVAS_MS - (Date.now() - t.desde)) / 60_000)
  return null
}

function registrarTentativaFalha(ip: string): void {
  const t = estado.tentativas.get(ip)
  if (!t || Date.now() - t.desde > JANELA_TENTATIVAS_MS)
    estado.tentativas.set(ip, { contagem: 1, desde: Date.now() })
  else
    t.contagem++
}

/**
 * Tenta logar. Lança 429 se o IP estourou tentativas, 401 se a senha está
 * errada. Em caso de sucesso, já seta o cookie de sessão na resposta.
 */
export function login(event: H3Event, senha: string): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'desconhecido'

  const bloqueio = bloqueadoPorTentativas(ip)
  if (bloqueio !== null) {
    throw createError({
      statusCode: 429,
      statusMessage: `Muitas tentativas. Tente de novo em ${bloqueio}min.`,
    })
  }

  if (!senhaConfere(senha)) {
    registrarTentativaFalha(ip)
    throw createError({ statusCode: 401, statusMessage: 'Senha incorreta' })
  }

  estado.tentativas.delete(ip)
  limparSessoesExpiradas()

  const token = randomBytes(32).toString('hex')
  estado.sessoes.set(token, Date.now() + SESSAO_TTL_MS)

  setCookie(event, COOKIE_NOME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSAO_TTL_MS / 1000,
    path: '/',
  })
}

export function logout(event: H3Event): void {
  const token = getCookie(event, COOKIE_NOME)
  if (token)
    estado.sessoes.delete(token)
  deleteCookie(event, COOKIE_NOME, { path: '/' })
}

export function estaAutenticado(event: H3Event): boolean {
  const token = getCookie(event, COOKIE_NOME)
  if (!token)
    return false
  const validade = estado.sessoes.get(token)
  if (!validade || validade < Date.now()) {
    estado.sessoes.delete(token)
    return false
  }
  return true
}

/** Chamar no topo de toda rota protegida — lança 401 se não estiver logado. */
export function exigirAdmin(event: H3Event): void {
  if (!estaAutenticado(event))
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
}
