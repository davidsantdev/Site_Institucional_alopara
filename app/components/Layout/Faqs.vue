<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'
import { linkWhatsapp } from '~/composables/useNavegacao'
import Accordion from '../ui/accordion/Accordion.vue'
import AccordionContent from '../ui/accordion/AccordionContent.vue'
import AccordionItem from '../ui/accordion/AccordionItem.vue'
import AccordionTrigger from '../ui/accordion/AccordionTrigger.vue'

const perguntas = [
  {
    valor: 'como-comprar',
    pergunta: 'Como faço um pedido pelo site?',
    resposta: 'Escolha os produtos, monte seu carrinho e toque em "Finalizar no WhatsApp". A lista vai pronta pra nossa equipe, que confirma tudo com você pela conversa.',
  },
  {
    valor: 'horario',
    pergunta: 'Quais são os horários de funcionamento do Alô Pará?',
    resposta: 'Matriz e Filial: de segunda a sábado, das 7h às 21h; domingo, das 7h às 12h30. Em feriados o horário pode ser reduzido (das 7h às 12h30).',
  },
  {
    valor: 'pagamento',
    pergunta: 'Quais formas de pagamento o supermercado aceita?',
    resposta: 'Aceitamos dinheiro, cartões de débito e crédito, Pix e outras formas de pagamento disponíveis na loja.',
  },
  {
    valor: 'app',
    pergunta: 'O Alô Pará possui aplicativo?',
    resposta: 'Sim! Com o nosso aplicativo você acompanha ofertas exclusivas, encartes atualizados e promoções em tempo real, direto no seu celular.',
  },
]
</script>

<template>
  <section class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 md:grid-cols-12 md:px-6 md:py-20 lg:px-8">
    <div class="md:col-span-4">
      <p class="text-sm font-semibold text-red-600">
        Dúvidas
      </p>
      <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-(--texto-primario) md:text-4xl">
        Perguntas frequentes
      </h2>
      <p class="mt-3 text-(--texto-fraco)">
        Não achou o que procurava? A gente responde rapidinho pelo WhatsApp.
      </p>
      <a
        :href="linkWhatsapp('Olá! Vim pelo site do Alô Pará e tenho uma dúvida.')"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 inline-flex items-center gap-2 rounded-full border border-(--borda-forte) px-5 py-2.5 text-sm font-semibold text-(--texto-primario) transition hover:border-[#25D366] hover:text-[#1a9e4f]"
      >
        <MessageCircle :size="17" />
        Falar com a gente
      </a>
    </div>

    <Accordion type="single" collapsible default-value="" class="flex flex-col gap-3 md:col-span-8">
      <AccordionItem
        v-for="item in perguntas"
        :key="item.valor"
        :value="item.valor"
        class="rounded-2xl border border-(--borda) bg-(--bg-cartao) px-5 transition-colors data-[state=open]:border-(--borda-forte) data-[state=open]:shadow-(--sombra-1)"
      >
        <AccordionTrigger class="py-5 text-left text-[15px] font-semibold text-(--texto-primario) hover:no-underline md:text-base">
          {{ item.pergunta }}
        </AccordionTrigger>
        <AccordionContent class="pb-5">
          <p class="text-[15px] leading-relaxed text-(--texto-esmaecido)">
            {{ item.resposta }}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </section>
</template>
