/**
 * Guarda o código de indicação (?ref=CODIGO) que a pessoa trouxe no link,
 * pra reaparecer sozinho na mensagem do WhatsApp quando ela finalizar o
 * pedido — mesmo que isso aconteça em outra página, minutos depois.
 * Fica em localStorage (não em cookie) porque é só front-end lendo isso;
 * o servidor nunca precisa saber do código até o admin registrar a venda.
 */
const CHAVE_STORAGE = 'alopara-ref-codigo'
const VALIDADE_DIAS = 30

interface CodigoGuardado {
  codigo: string
  expiraEm: number
}

/** Chamar uma vez ao montar o app — lê `?ref=` da URL atual, se tiver. */
export function capturarCodigoAfiliado(): void {
  if (import.meta.server)
    return

  try {
    const params = new URLSearchParams(window.location.search)
    const bruto = params.get('ref')
    if (!bruto?.trim())
      return

    const codigo = bruto.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (!codigo)
      return

    const dados: CodigoGuardado = { codigo, expiraEm: Date.now() + VALIDADE_DIAS * 86_400_000 }
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados))
  }
  catch {
    // localStorage bloqueado (modo privado, etc.) — sem indicação, sem problema.
  }
}

/** Lê o código guardado, se ainda válido. `null` se não tiver ou tiver expirado. */
export function obterCodigoAfiliado(): string | null {
  if (import.meta.server)
    return null

  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE)
    if (!bruto)
      return null

    const dados = JSON.parse(bruto) as CodigoGuardado
    if (!dados?.codigo || Date.now() > dados.expiraEm) {
      localStorage.removeItem(CHAVE_STORAGE)
      return null
    }
    return dados.codigo
  }
  catch {
    return null
  }
}
