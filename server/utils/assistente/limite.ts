import process from 'node:process'

/**
 * Freio de uso do assistente — cada mensagem custa uma chamada na IA, e a rota
 * é pública. Limita por pessoa (IP) e no total do dia, pra conta da IA nunca
 * disparar por abuso ou robô. Em memória: reinicia junto com o servidor, o
 * que pra um limite diário é aceitável.
 */
const POR_MINUTO = 8
const POR_DIA_POR_IP = 60
const LIMITE_DIARIO = Number(process.env.ASSISTENTE_LIMITE_DIARIO) || 1000

interface Uso { minuto: number[], dia: number }

interface EstadoLimite { dia: string, totalDia: number, porIp: Map<string, Uso> }

const estado: EstadoLimite = (globalThis as any).__assistenteLimite ??= {
  dia: '',
  totalDia: 0,
  porIp: new Map<string, Uso>(),
} satisfies EstadoLimite

function hoje(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Belem' })
}

/** null = pode; texto = motivo pra mostrar ao cliente. */
export function verificarLimite(ip: string): string | null {
  const dia = hoje()
  if (estado.dia !== dia) {
    estado.dia = dia
    estado.totalDia = 0
    estado.porIp.clear()
  }
  if (estado.totalDia >= LIMITE_DIARIO)
    return 'O assistente atingiu o limite de conversas de hoje. Volte amanhã, ou fale com a gente pelo WhatsApp!'

  const agora = Date.now()
  const uso = estado.porIp.get(ip) ?? { minuto: [], dia: 0 }
  uso.minuto = uso.minuto.filter(t => agora - t < 60_000)
  if (uso.dia >= POR_DIA_POR_IP)
    return 'Você já conversou bastante comigo hoje! Volte amanhã, ou fale com a gente pelo WhatsApp.'
  if (uso.minuto.length >= POR_MINUTO)
    return 'Calma, estou anotando! Espere um minutinho e mande de novo.'

  uso.minuto.push(agora)
  uso.dia++
  estado.porIp.set(ip, uso)
  estado.totalDia++
  return null
}
