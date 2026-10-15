<script setup lang="ts">
import type { Pergunta } from '~/composables/usePesquisaSatisfacao'
/**
 * Formulário da pesquisa interna de satisfação dos colaboradores. Página
 * "escondida" de propósito: não aparece em nenhum menu do site, só é
 * alcançada por quem recebe o link direto (ver nuxt.config.ts — fora do
 * sitemap e do robots.txt, e com noindex/nofollow aqui também, 2ª camada).
 */
import { Lock } from 'lucide-vue-next'
import { reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { listarPerguntas, SECOES_PESQUISA } from '~/composables/usePesquisaSatisfacao'

useSeoMeta({
  title: 'Pesquisa de Satisfação | Alô Pará',
  robots: 'noindex, nofollow',
})

const nome = ref('')
const setor = ref('')
const tempoEmpresa = ref('')
const data = ref(new Date().toISOString().slice(0, 10))
const declaracao = ref(false)

const respostas = reactive<Record<string, string>>({})

const enviando = ref(false)
const enviado = ref(false)

function mostrarDetalhe(pergunta: Pergunta): boolean {
  if (!pergunta.detalhe)
    return false
  if (!pergunta.detalhe.mostrarSe)
    return true
  return pergunta.detalhe.mostrarSe.includes(respostas[pergunta.id] ?? '')
}

function validar(): string | null {
  if (!setor.value.trim())
    return 'Informe o setor.'
  if (!data.value)
    return 'Informe a data.'

  for (const pergunta of listarPerguntas()) {
    if ((pergunta.tipo === 'radio' || pergunta.tipo === 'nota') && !respostas[pergunta.id])
      return `Falta responder: "${pergunta.texto}"`
  }

  if (!declaracao.value)
    return 'Confirme a declaração final antes de enviar.'

  return null
}

async function enviar() {
  const erro = validar()
  if (erro) {
    toast.error(erro)
    return
  }

  enviando.value = true
  try {
    await $fetch('/api/pesquisa-satisfacao', {
      method: 'POST',
      body: {
        nome: nome.value,
        setor: setor.value,
        tempoEmpresa: tempoEmpresa.value,
        data: data.value,
        declaracao: declaracao.value,
        respostas: { ...respostas },
      },
    })
    enviado.value = true
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao enviar — verifique a conexão e tente de novo.')
  }
  finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-(--bg-pagina) py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- SUCESSO -->
      <div v-if="enviado" class="bg-(--bg-cartao) border border-(--borda) rounded-2xl p-10 text-center flex flex-col items-center gap-3">
        <span class="text-red-600 text-[11px] font-black tracking-[3px] uppercase">Alô Pará</span>
        <h1 class="text-(--texto-primario) text-[26px] font-black tracking-tight">
          Obrigado por responder!
        </h1>
        <p class="text-(--texto-suave) text-[14px] max-w-md">
          Sua resposta foi registrada. Ela é importante pra gente melhorar o dia a dia de todo mundo aqui na empresa.
        </p>
      </div>

      <!-- FORMULÁRIO -->
      <form v-else class="flex flex-col gap-6" @submit.prevent="enviar">
        <!-- CABEÇALHO -->
        <div class="bg-(--bg-cartao) border border-(--borda) rounded-2xl p-7">
          <span class="text-red-600 text-[11px] font-black tracking-[3px] uppercase">Supermercado Alô Pará</span>
          <h1 class="text-(--texto-primario) text-[26px] md:text-[30px] font-black tracking-tight mt-1 mb-4 leading-tight">
            Pesquisa Interna de Satisfação dos Colaboradores
          </h1>
          <p class="text-(--texto-suave) text-[14px] leading-relaxed mb-3">
            Este formulário tem como objetivo entender melhor como nossos colaboradores se sentem em relação à empresa,
            ao ambiente de trabalho, à liderança, aos benefícios e às condições oferecidas.
          </p>
          <p class="text-(--texto-suave) text-[14px] leading-relaxed mb-4">
            Pedimos que responda com sinceridade. Suas respostas serão importantes para identificarmos pontos positivos
            e oportunidades de melhoria.
          </p>

          <div class="flex items-start gap-3 rounded-xl border border-red-600/30 bg-red-600/5 px-4 py-3">
            <Lock :size="15" class="text-red-600 shrink-0 mt-0.5" />
            <p class="text-(--texto-primario) text-[13px] font-semibold leading-relaxed">
              As respostas são confidenciais e serão lidas somente pela direção SARIYA.
            </p>
          </div>
        </div>

        <!-- IDENTIFICAÇÃO -->
        <div class="bg-(--bg-cartao) border border-(--borda) rounded-2xl p-7 flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-black tracking-[2px] uppercase text-(--texto-fraco)">
              Nome do colaborador (opcional)
            </label>
            <input
              v-model="nome"
              type="text"
              placeholder="Pode deixar em branco — a resposta é anônima se preferir"
              class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-(--texto-minimo) focus:border-red-600 transition-colors duration-200 w-full"
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-black tracking-[2px] uppercase text-(--texto-fraco)">
                Setor *
              </label>
              <input
                v-model="setor"
                type="text"
                placeholder="Ex.: Caixa, Açougue, Estoque..."
                class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-(--texto-minimo) focus:border-red-600 transition-colors duration-200 w-full"
              >
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[11px] font-black tracking-[2px] uppercase text-(--texto-fraco)">
                Tempo de empresa
              </label>
              <input
                v-model="tempoEmpresa"
                type="text"
                placeholder="Ex.: 1 ano e 3 meses"
                class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-(--texto-minimo) focus:border-red-600 transition-colors duration-200 w-full"
              >
            </div>
          </div>

          <div class="flex flex-col gap-2 md:w-1/2">
            <label class="text-[11px] font-black tracking-[2px] uppercase text-(--texto-fraco)">
              Data *
            </label>
            <input
              v-model="data"
              type="date"
              class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[14px] px-4 py-3 rounded-xl outline-none focus:border-red-600 transition-colors duration-200 w-full"
            >
          </div>
        </div>

        <!-- SEÇÕES -->
        <div v-for="secao in SECOES_PESQUISA" :key="secao.titulo" class="bg-(--bg-cartao) border border-(--borda) rounded-2xl p-7">
          <div class="flex items-center gap-4 mb-6">
            <h2 class="text-red-600 text-[11px] font-black tracking-[3px] uppercase shrink-0">
              {{ secao.titulo }}
            </h2>
            <div class="flex-1 h-px bg-(--borda)" />
          </div>

          <div class="flex flex-col gap-7">
            <div v-for="pergunta in secao.perguntas" :key="pergunta.id" class="flex flex-col gap-3">
              <p class="text-(--texto-primario) text-[15px] font-semibold leading-snug">
                {{ pergunta.texto }}
                <span v-if="pergunta.tipo !== 'texto'" class="text-red-600">*</span>
              </p>

              <!-- radio -->
              <div v-if="pergunta.tipo === 'radio'" class="flex flex-col gap-2">
                <label
                  v-for="opcao in pergunta.opcoes"
                  :key="opcao"
                  class="flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors"
                  :class="respostas[pergunta.id] === opcao ? 'border-red-600 bg-red-600/10' : 'border-(--borda) hover:border-(--borda-forte)'"
                >
                  <input
                    v-model="respostas[pergunta.id]"
                    type="radio"
                    :name="pergunta.id"
                    :value="opcao"
                    class="accent-red-600 w-4 h-4 shrink-0"
                  >
                  <span class="text-(--texto-primario) text-[14px]">{{ opcao }}</span>
                </label>
              </div>

              <!-- nota 0-10 -->
              <div v-else-if="pergunta.tipo === 'nota'" class="flex flex-wrap gap-2">
                <button
                  v-for="n in 11"
                  :key="n - 1"
                  type="button"
                  class="w-10 h-10 rounded-lg border text-[13px] font-bold transition-colors"
                  :class="respostas[pergunta.id] === String(n - 1)
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-(--borda) text-(--texto-secundario) hover:border-red-600'"
                  @click="respostas[pergunta.id] = String(n - 1)"
                >
                  {{ n - 1 }}
                </button>
              </div>

              <!-- texto livre -->
              <textarea
                v-else
                v-model="respostas[pergunta.id]"
                rows="3"
                placeholder="Opcional — escreva se quiser"
                class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[14px] px-4 py-3 rounded-xl outline-none placeholder:text-(--texto-minimo) focus:border-red-600 transition-colors duration-200 w-full resize-none"
              />

              <!-- detalhe condicional (ex.: "Qual?") -->
              <textarea
                v-if="mostrarDetalhe(pergunta)"
                v-model="respostas[pergunta.detalhe!.id]"
                rows="2"
                :placeholder="pergunta.detalhe!.label"
                class="bg-(--bg-input) border border-(--borda) text-(--texto-primario) text-[13px] px-4 py-3 rounded-xl outline-none placeholder:text-(--texto-minimo) focus:border-red-600 transition-colors duration-200 w-full resize-none"
              />
            </div>
          </div>
        </div>

        <!-- DECLARAÇÃO FINAL -->
        <div class="bg-(--bg-cartao) border border-(--borda) rounded-2xl p-7 flex flex-col gap-5">
          <h2 class="text-red-600 text-[11px] font-black tracking-[3px] uppercase">
            Declaração final
          </h2>
          <p class="text-(--texto-suave) text-[14px] leading-relaxed">
            Declaro que as respostas acima representam minha opinião sobre o ambiente de trabalho e que tive liberdade
            para responder às perguntas.
          </p>
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="declaracao" type="checkbox" class="accent-red-600 w-4 h-4 shrink-0">
            <span class="text-(--texto-primario) text-[14px] font-semibold">Estou de acordo com a declaração acima</span>
          </label>

          <button
            type="submit"
            :disabled="enviando"
            class="mt-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all text-white font-black text-[13px] tracking-widest uppercase py-4 rounded-xl"
          >
            {{ enviando ? 'Enviando...' : 'Enviar pesquisa' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
