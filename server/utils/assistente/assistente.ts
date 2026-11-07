/**
 * Assistente de compras do site: a IA conversa com o cliente e usa duas
 * "ferramentas" daqui — buscar no catálogo e colocar no carrinho. Ela nunca
 * vê a CISS: tudo sai do catálogo em memória (getCatalogo/consultar), então
 * não existe produto ou preço inventado — o que ela adiciona é validado aqui
 * pelo id, com o preço de verdade.
 *
 * O carrinho em si mora no navegador (localStorage): a resposta só diz o que
 * adicionar/remover, e o front aplica (ver AssistenteVirtual.vue).
 */
import type { Categoria, Produto } from '../catalogo'
import type { ChamadaFerramenta, FerramentaIA, MensagemIA } from './ia'
import { buscarProduto, consultar, getCatalogo, normalizarBusca } from '../catalogo'
import { conversar } from './ia'

export interface ItemCarrinhoCliente {
  nome: string
  quantidade: number
  preco: number
  pesavel: boolean
}

export interface MensagemHistorico {
  papel: 'cliente' | 'assistente'
  texto: string
}

export interface RespostaAssistente {
  mensagem: string
  adicionar: { produto: Produto, quantidade: number }[]
  /** Nomes (exatos, como estão no carrinho) pra tirar. */
  remover: string[]
}

const CATEGORIAS: Categoria[] = ['alimentos', 'bebidas', 'limpeza', 'perfumaria', 'frutas', 'carnes']
/** Teto de rodadas IA ↔ ferramentas por mensagem — segura custo e demora num caso que entre em loop. */
const MAX_RODADAS = 6
const RESULTADOS_POR_BUSCA = 10

const FERRAMENTAS: FerramentaIA[] = [
  {
    type: 'function',
    function: {
      name: 'buscar_produtos',
      description: 'Busca produtos à venda no catálogo do supermercado (só o que tem em estoque). Pode chamar várias vezes em paralelo, uma por ingrediente. Use termos curtos no singular, como o produto se chama na prateleira: "arroz", "feijao preto", "refrigerante", "carne picanha", "linguica calabresa", "leite condensado". Se não achar, tente outro termo mais simples ou um sinônimo.',
      parameters: {
        type: 'object',
        properties: {
          termo: { type: 'string', description: 'O que procurar (1 a 3 palavras).' },
          preco_maximo: { type: 'number', description: 'Só produtos até este preço (por unidade, ou por kg nos vendidos no peso).' },
          categoria: { type: 'string', enum: CATEGORIAS, description: 'Restringe a uma seção: frutas = hortifruti; carnes = açougue e frios; perfumaria = higiene pessoal.' },
          somente_ofertas: { type: 'boolean', description: 'Só produtos em promoção.' },
          mais_baratos_primeiro: { type: 'boolean', description: 'Ordena do mais barato pro mais caro.' },
        },
        required: ['termo'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'adicionar_ao_carrinho',
      description: 'Coloca produtos no carrinho do cliente (use os ids que vieram de buscar_produtos). Devolve o subtotal de cada item e o total do carrinho, pra conferir o orçamento.',
      parameters: {
        type: 'object',
        properties: {
          itens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                quantidade: { type: 'number', description: 'Unidades; nos produtos vendidos "por kg", é o peso em kg (0.5 = 500 g).' },
              },
              required: ['id', 'quantidade'],
              additionalProperties: false,
            },
          },
        },
        required: ['itens'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'remover_do_carrinho',
      description: 'Tira itens do carrinho do cliente. Use o nome exatamente como aparece na lista do carrinho atual.',
      parameters: {
        type: 'object',
        properties: {
          nomes: { type: 'array', items: { type: 'string' } },
        },
        required: ['nomes'],
        additionalProperties: false,
      },
    },
  },
]

const INSTRUCOES = `Você é o Alô, assistente de compras do site do Supermercado Alô Pará (Novo Repartimento - PA). Você conversa com clientes em português do Brasil, de um jeito simpático, direto e curto — como um atendente bom de mercado.

O que você faz:
- Monta compras inteiras: quando o cliente pede uma refeição ou ocasião (ceia de Natal, feijoada, churrasco, café da manhã, festa, compra do mês...), pense nos ingredientes típicos, busque cada um com buscar_produtos (várias buscas de uma vez) e já adicione tudo com adicionar_ao_carrinho. NÃO peça confirmação antes de adicionar: o cliente quer o carrinho pronto.
- Acha produtos: em "tem refrigerante de 5 reais?", busque com preco_maximo, escolha a melhor opção, adicione 1 unidade e cite 1 ou 2 alternativas.
- Ajusta o carrinho: tirar, trocar, aumentar, deixar mais barato — use remover_do_carrinho e adicionar_ao_carrinho.

Regras:
- Só fale de produto e preço que vieram de buscar_produtos. Nunca invente produto, preço, marca ou promoção.
- Orçamento: a soma do que você adicionar tem que caber no valor que o cliente disse (confira pelo total que adicionar_ao_carrinho devolve; considere o que já estava no carrinho só se o cliente disser que o valor é pro carrinho todo). Prefira itens em oferta, priorize o essencial da receita e chegue perto do valor sem passar. Se não couber tudo, diga o que ficou de fora.
- Sem orçamento: escolha opções de preço médio, boas e populares, não as mais caras.
- Produto "por kg": a quantidade é em kg (0.5 = 500 g). Calcule pela quantidade de pessoas (ex.: carne de churrasco ~0,35 kg por pessoa). Se o cliente não disser quantas pessoas, considere 4.
- Escolha o tamanho certo: refrigerante de 2 L pra família, não latinha ou 200 ml; nada de sachê quando a receita pede pacote.
- Se a busca não achar algo, tente outro termo; se mesmo assim não tiver, diga que está em falta e siga com o resto.
- Assuntos fora do mercado: diga com gentileza que só ajuda com compras do Alô Pará.
- Informações da loja: horário seg a sáb 7h às 21h, domingo 7h às 12h30. O pedido é finalizado pelo WhatsApp (94) 99192-3141, no botão do carrinho. Clube Alô dá preços especiais nos produtos marcados como Clube.

Resposta final ao cliente: 1 a 4 frases curtas, sem markdown (nada de **, # ou tabelas). Os itens adicionados já aparecem em cartões na tela, então NÃO liste produto por produto: resuma (ex.: "Montei sua feijoada pra 6 pessoas: deu R$ 47,80 dos R$ 50.") e diga o que ficou de fora ou ofereça um ajuste. Valores no formato R$ 12,90.`

function reais(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

/** Bate no começo de alguma palavra: "pao" acha "PAO DE FORMA", mas não "SABAO". */
function bateNoInicioDePalavra(texto: string, palavra: string): boolean {
  return texto.startsWith(palavra) || texto.includes(` ${palavra}`) || texto.includes(`/${palavra}`)
}

function buscar(catalogo: Awaited<ReturnType<typeof getCatalogo>>, args: Record<string, unknown>) {
  const termo = String(args.termo ?? '').slice(0, 60).trim()
  if (!termo)
    return { erro: 'termo vazio' }
  const categoria = CATEGORIAS.includes(args.categoria as Categoria) ? args.categoria as Categoria : null
  const precoMax = Number(args.preco_maximo) > 0 ? Number(args.preco_maximo) : Infinity
  const { produtos } = consultar(catalogo, categoria, termo, 1, 300, {
    somenteEmPromocao: args.somente_ofertas === true,
    ordenar: args.mais_baratos_primeiro === true ? 'menor-preco' : undefined,
  })

  const palavras = normalizarBusca(termo).split(/\s+/).filter(Boolean)
  const primeira = palavras[0] ?? ''
  const pontuados = produtos
    .filter(p => Number(p.preco2) <= precoMax)
    .map((p) => {
      const nome = normalizarBusca(p.nome)
      const completo = `${nome} ${normalizarBusca(p.tipo)}`
      if (!palavras.every(w => bateNoInicioDePalavra(completo, w)))
        return null
      const nota = nome.startsWith(palavras.join(' ')) ? 0 : nome.startsWith(primeira) ? 1 : palavras.every(w => bateNoInicioDePalavra(nome, w)) ? 2 : 3
      return { p, nota }
    })
    .filter(x => x !== null)
  // Sort estável: dentro da mesma nota fica a ordem do consultar() (ou a de preço, se pedida).
  if (args.mais_baratos_primeiro !== true)
    pontuados.sort((a, b) => a.nota - b.nota)

  const escolhidos = (pontuados.length ? pontuados.map(x => x.p) : produtos.filter(p => Number(p.preco2) <= precoMax))
    .slice(0, RESULTADOS_POR_BUSCA)

  return {
    resultados: escolhidos.map(p => ({
      id: p.id,
      nome: p.nome,
      preco: Number(p.preco2),
      vendido_por: p.pesavel ? 'kg' : 'unidade',
      ...(p.emPromocao ? { em_oferta: true, preco_antes: Number(p.precoOriginal) } : {}),
    })),
    ...(escolhidos.length ? {} : { aviso: 'nada encontrado — tente outro termo' }),
  }
}

/** Quantidade sã: unidade inteira de 1 a 50; peso de 50 g a 20 kg, de 50 em 50 g. */
function quantidadeValida(produto: Produto, bruta: unknown): number | null {
  const q = Number(bruta)
  if (!Number.isFinite(q) || q <= 0)
    return null
  if (produto.pesavel)
    return Math.min(20, Math.max(0.05, Math.round(q * 20) / 20))
  return Math.min(50, Math.max(1, Math.round(q)))
}

export async function responder(
  historico: MensagemHistorico[],
  carrinho: ItemCarrinhoCliente[],
): Promise<RespostaAssistente> {
  const catalogo = await getCatalogo()

  const agora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Belem',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())

  const totalCarrinho = carrinho.reduce((acc, i) => acc + Math.round(i.preco * i.quantidade * 100), 0) / 100
  const resumoCarrinho = carrinho.length
    ? carrinho.map(i => `- ${i.nome} | ${i.pesavel ? `${i.quantidade} kg` : `${i.quantidade} un`} | ${reais(i.preco * i.quantidade)}`).join('\n')
    : '(vazio)'

  const mensagens: MensagemIA[] = [
    // Uma mensagem de sistema só, no começo — o formato que todo provedor aceita.
    // As instruções fixas vêm primeiro (prefixo igual entre pedidos = cache mais barato).
    { role: 'system', content: `${INSTRUCOES}\n\nAgora: ${agora} (horário de Belém).\nCarrinho atual do cliente (total ${reais(totalCarrinho)}):\n${resumoCarrinho}` },
    ...historico.map(m => m.papel === 'cliente'
      ? { role: 'user' as const, content: m.texto }
      : { role: 'assistant' as const, content: m.texto }),
  ]

  // O que esta resposta vai mexer no carrinho (o front aplica no fim).
  const adicionar = new Map<string, { produto: Produto, quantidade: number }>()
  const remover = new Set<string>()
  const nomesNoCarrinho = new Map(carrinho.map(i => [normalizarBusca(i.nome), i.nome]))

  const totalAtual = () => {
    let centavos = carrinho
      .filter(i => !remover.has(i.nome))
      .reduce((acc, i) => acc + Math.round(i.preco * i.quantidade * 100), 0)
    for (const { produto, quantidade } of adicionar.values())
      centavos += Math.round(Number(produto.preco2) * quantidade * 100)
    return centavos / 100
  }

  function executar(chamada: ChamadaFerramenta): unknown {
    let args: Record<string, unknown>
    try {
      args = JSON.parse(chamada.function.arguments || '{}')
    }
    catch {
      return { erro: 'argumentos inválidos (JSON)' }
    }

    if (chamada.function.name === 'buscar_produtos')
      return buscar(catalogo, args)

    if (chamada.function.name === 'adicionar_ao_carrinho') {
      const itens = Array.isArray(args.itens) ? args.itens.slice(0, 30) : []
      const adicionados: unknown[] = []
      const erros: string[] = []
      for (const item of itens as { id?: unknown, quantidade?: unknown }[]) {
        const produto = buscarProduto(catalogo, String(item?.id ?? ''))
        if (!produto) {
          erros.push(`id ${String(item?.id)} não existe ou está sem estoque`)
          continue
        }
        const quantidade = quantidadeValida(produto, item?.quantidade)
        if (quantidade === null) {
          erros.push(`quantidade inválida para ${produto.nome}`)
          continue
        }
        const anterior = adicionar.get(produto.id)?.quantidade ?? 0
        const nova = produto.pesavel ? Math.round((anterior + quantidade) * 1000) / 1000 : anterior + quantidade
        adicionar.set(produto.id, { produto, quantidade: nova })
        // Se a IA tinha mandado tirar este mesmo produto, adicionar de novo cancela a remoção.
        remover.delete(produto.nome)
        adicionados.push({
          nome: produto.nome,
          quantidade: produto.pesavel ? `${quantidade} kg` : quantidade,
          subtotal: Math.round(Number(produto.preco2) * quantidade * 100) / 100,
        })
      }
      return { adicionados, ...(erros.length ? { erros } : {}), total_do_carrinho_agora: totalAtual() }
    }

    if (chamada.function.name === 'remover_do_carrinho') {
      const nomes = Array.isArray(args.nomes) ? args.nomes.slice(0, 50) : []
      const removidos: string[] = []
      const naoEncontrados: string[] = []
      for (const bruto of nomes) {
        const chave = normalizarBusca(String(bruto))
        // Item que esta mesma resposta tinha acabado de adicionar: só desfaz.
        const recemAdicionado = [...adicionar.values()].find(a => normalizarBusca(a.produto.nome) === chave)
        if (recemAdicionado) {
          adicionar.delete(recemAdicionado.produto.id)
          removidos.push(recemAdicionado.produto.nome)
          continue
        }
        const nome = nomesNoCarrinho.get(chave)
          ?? [...nomesNoCarrinho.entries()].find(([n]) => n.includes(chave))?.[1]
        if (nome) {
          remover.add(nome)
          removidos.push(nome)
        }
        else {
          naoEncontrados.push(String(bruto))
        }
      }
      return { removidos, ...(naoEncontrados.length ? { nao_encontrados: naoEncontrados } : {}), total_do_carrinho_agora: totalAtual() }
    }

    return { erro: `ferramenta desconhecida: ${chamada.function.name}` }
  }

  let texto = ''
  for (let rodada = 0; rodada < MAX_RODADAS; rodada++) {
    // Se na última rodada ainda quiser ferramenta, para por aí e usa a frase padrão lá embaixo.
    const resposta = await conversar(mensagens, FERRAMENTAS)
    if (!resposta.chamadas.length || rodada === MAX_RODADAS - 1) {
      texto = resposta.texto
      break
    }
    mensagens.push({ role: 'assistant', content: resposta.texto || null, tool_calls: resposta.chamadas })
    for (const chamada of resposta.chamadas)
      mensagens.push({ role: 'tool', tool_call_id: chamada.id, content: JSON.stringify(executar(chamada)) })
  }

  return {
    mensagem: texto || (adicionar.size ? 'Pronto, coloquei no seu carrinho! Quer ajustar alguma coisa?' : 'Desculpe, não consegui entender. Pode me dizer de outro jeito?'),
    adicionar: [...adicionar.values()],
    remover: [...remover],
  }
}
