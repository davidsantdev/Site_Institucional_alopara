/**
 * Pesquisa interna de satisfação dos colaboradores — define aqui as 38
 * perguntas (texto, seção, tipo) pra ser a mesma fonte usada tanto pelo
 * formulário público (pages/pesquisa-satisfacao.vue) quanto pelo painel do
 * admin que lista as respostas (pages/admin/pesquisa.vue), sem duplicar o
 * texto das perguntas nos dois lugares.
 */

export type TipoPergunta = 'radio' | 'nota' | 'texto'

export interface Pergunta {
  id: string
  tipo: TipoPergunta
  texto: string
  opcoes?: string[]
  /** Campo de texto livre que acompanha a pergunta (ex.: "Qual?"). */
  detalhe?: {
    id: string
    label: string
    /** Só aparece quando a opção escolhida é uma destas. Sem isso, aparece sempre que a pergunta for respondida. */
    mostrarSe?: string[]
  }
}

export interface Secao {
  titulo: string
  perguntas: Pergunta[]
}

const FREQ5 = ['Sempre', 'Na maioria das vezes', 'Às vezes', 'Raramente', 'Nunca']

export const SECOES_PESQUISA: Secao[] = [
  {
    titulo: '1. Satisfação e bem-estar',
    perguntas: [
      { id: 'p1', tipo: 'radio', texto: 'Como você se sente atualmente trabalhando na empresa?', opcoes: ['Muito satisfeito(a)', 'Satisfeito(a)', 'Indiferente', 'Insatisfeito(a)', 'Muito insatisfeito(a)'] },
      { id: 'p2', tipo: 'radio', texto: 'Você se sente bem e confortável no seu ambiente de trabalho?', opcoes: FREQ5 },
      { id: 'p3', tipo: 'radio', texto: 'Você sente vontade e motivação para vir trabalhar?', opcoes: FREQ5 },
      { id: 'p4', tipo: 'nota', texto: 'De 0 a 10, qual nota você daria para sua satisfação em trabalhar no Alô Pará?' },
    ],
  },
  {
    titulo: '2. Sobre a empresa',
    perguntas: [
      { id: 'p5', tipo: 'radio', texto: 'Você considera o Alô Pará uma boa empresa para trabalhar?', opcoes: ['Sim', 'Em parte', 'Não'] },
      { id: 'p6', tipo: 'radio', texto: 'Você indicaria o Alô Pará para um amigo ou familiar trabalhar?', opcoes: ['Sim', 'Talvez', 'Não'] },
      { id: 'p7', tipo: 'radio', texto: 'Você sente orgulho de fazer parte da empresa?', opcoes: ['Sim', 'Às vezes', 'Não'] },
      { id: 'p8', tipo: 'radio', texto: 'Você acredita que a empresa trata seus colaboradores com respeito?', opcoes: FREQ5 },
      { id: 'p9', tipo: 'texto', texto: 'Na sua opinião, qual é o principal ponto positivo da empresa?' },
      { id: 'p10', tipo: 'texto', texto: 'Se você pudesse mudar alguma coisa na empresa hoje, o que mudaria?' },
    ],
  },
  {
    titulo: '3. Ambiente de trabalho e equipe',
    perguntas: [
      { id: 'p11', tipo: 'radio', texto: 'Como você avalia o relacionamento entre os colegas do seu setor?', opcoes: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Muito ruim'] },
      { id: 'p12', tipo: 'radio', texto: 'Você sente que existe respeito entre os colegas de trabalho?', opcoes: FREQ5 },
      { id: 'p13', tipo: 'radio', texto: 'Você sente que existe colaboração e trabalho em equipe no seu setor?', opcoes: ['Sim', 'Em parte', 'Não'] },
      {
        id: 'p14',
        tipo: 'radio',
        texto: 'Existe alguma situação, comportamento ou atitude no ambiente de trabalho que incomoda você?',
        opcoes: ['Não', 'Sim'],
        detalhe: { id: 'p14_detalhe', label: 'Qual?', mostrarSe: ['Sim'] },
      },
      {
        id: 'p15',
        tipo: 'radio',
        texto: 'Você já se sentiu desrespeitado(a), desvalorizado(a) ou tratado(a) de maneira inadequada no ambiente de trabalho?',
        opcoes: ['Nunca', 'Raramente', 'Algumas vezes', 'Frequentemente'],
        detalhe: { id: 'p15_detalhe', label: 'Se desejar explicar (opcional)' },
      },
    ],
  },
  {
    titulo: '4. Liderança e gerência',
    perguntas: [
      { id: 'p16', tipo: 'radio', texto: 'Você sente que pode conversar com seu líder ou com a gerência quando tem algum problema?', opcoes: ['Sim, tranquilamente', 'Na maioria das vezes', 'Às vezes', 'Não'] },
      { id: 'p17', tipo: 'radio', texto: 'Você considera que seu líder trata a equipe com respeito e igualdade?', opcoes: FREQ5 },
      { id: 'p18', tipo: 'radio', texto: 'As orientações recebidas dos responsáveis pelo seu setor são claras?', opcoes: FREQ5 },
      { id: 'p19', tipo: 'radio', texto: 'Você sente que seu trabalho é reconhecido pela liderança?', opcoes: ['Sim', 'Às vezes', 'Não'] },
      { id: 'p20', tipo: 'texto', texto: 'O que você acha que a liderança poderia melhorar?' },
    ],
  },
  {
    titulo: '5. Comunicação e organização',
    perguntas: [
      { id: 'p21', tipo: 'radio', texto: 'Você considera que a comunicação interna da empresa funciona bem?', opcoes: ['Muito bem', 'Bem', 'Regular', 'Mal', 'Muito mal'] },
      { id: 'p22', tipo: 'radio', texto: 'Você recebe as informações necessárias para realizar seu trabalho corretamente?', opcoes: FREQ5 },
      { id: 'p23', tipo: 'radio', texto: 'Você considera seu setor organizado?', opcoes: ['Muito organizado', 'Organizado', 'Regular', 'Desorganizado', 'Muito desorganizado'] },
      { id: 'p24', tipo: 'texto', texto: 'O que poderia melhorar na organização do seu setor?' },
    ],
  },
  {
    titulo: '6. Horários, folgas e carga de trabalho',
    perguntas: [
      { id: 'p25', tipo: 'radio', texto: 'Como você avalia sua carga de trabalho atualmente?', opcoes: ['Adequada', 'Um pouco pesada', 'Muito pesada', 'Poderia receber mais responsabilidades'] },
      { id: 'p26', tipo: 'radio', texto: 'Você considera sua escala de trabalho adequada?', opcoes: ['Sim', 'Em parte', 'Não'] },
      { id: 'p27', tipo: 'radio', texto: 'Quando houver horas a 100%, qual opção você prefere?', opcoes: ['Receber o valor das horas a 100%', 'Compensar as horas com folga', 'Depende da situação', 'Não tenho preferência'] },
      { id: 'p28', tipo: 'radio', texto: 'Você considera que consegue conciliar adequadamente trabalho e vida pessoal?', opcoes: ['Sim', 'Na maioria das vezes', 'Às vezes', 'Não'] },
    ],
  },
  {
    titulo: '7. Benefícios e condições de trabalho',
    perguntas: [
      { id: 'p29', tipo: 'radio', texto: 'Como você avalia os benefícios oferecidos atualmente pela empresa?', opcoes: ['Excelente', 'Bom', 'Regular', 'Ruim'] },
      { id: 'p30', tipo: 'texto', texto: 'Existe algum benefício que você gostaria que a empresa oferecesse? Qual?' },
      {
        id: 'p31',
        tipo: 'radio',
        texto: 'Você considera que possui os materiais, equipamentos e condições necessárias para realizar bem seu trabalho?',
        opcoes: ['Sim', 'Em parte', 'Não'],
        detalhe: { id: 'p31_detalhe', label: 'Se não, o que está faltando?', mostrarSe: ['Não'] },
      },
    ],
  },
  {
    titulo: '8. Crescimento e desenvolvimento',
    perguntas: [
      { id: 'p32', tipo: 'radio', texto: 'Você gostaria de crescer profissionalmente dentro do Alô Pará?', opcoes: ['Sim', 'Talvez', 'Não'] },
      { id: 'p33', tipo: 'radio', texto: 'Você gostaria de receber mais treinamentos para melhorar seu desempenho profissional?', opcoes: ['Sim', 'Talvez', 'Não'] },
      { id: 'p34', tipo: 'texto', texto: 'Existe alguma função ou área dentro da empresa em que você gostaria de trabalhar futuramente?' },
      { id: 'p35', tipo: 'radio', texto: 'Você sente que tem oportunidade de demonstrar seu potencial dentro da empresa?', opcoes: ['Sim', 'Às vezes', 'Não'] },
    ],
  },
  {
    titulo: '9. Sua opinião é importante',
    perguntas: [
      { id: 'p36', tipo: 'texto', texto: 'O que mais deixa você satisfeito(a) em trabalhar no Alô Pará?' },
      { id: 'p37', tipo: 'texto', texto: 'O que mais incomoda ou desmotiva você atualmente?' },
      { id: 'p38', tipo: 'texto', texto: 'Deixe aqui uma sugestão, crítica, elogio ou algo que você gostaria que a direção da empresa soubesse:' },
    ],
  },
]

/** Todas as perguntas, sem agrupar por seção — usado pra montar/validar o payload e pro CSV do admin. */
export function listarPerguntas(): Pergunta[] {
  return SECOES_PESQUISA.flatMap(secao => secao.perguntas)
}
