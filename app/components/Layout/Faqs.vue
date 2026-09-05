<script setup lang="ts">
import Accordion from '../ui/accordion/Accordion.vue'
import AccordionContent from '../ui/accordion/AccordionContent.vue'
import AccordionItem from '../ui/accordion/AccordionItem.vue'
import AccordionTrigger from '../ui/accordion/AccordionTrigger.vue'

const perguntas = [
  {
    valor: 'item-1',
    pergunta: 'Quais são os horários de funcionamento do Alô Pará?',
    resposta: 'Na Matriz 7:00 às 21:00 de segunda a sábado Domingo 7:00 às 12:30,  feriados podendo haver redução de horário dás 7:00 às 12:30. No Filial 7:00 às 21:00 de segunda a sábado Domingo 7:00 às 12:30, feriados podendo haver redução de horário dás 7:00 às 12:30',
  },
  {
    valor: 'item-2',
    pergunta: 'Quais formas de pagamento o supermercado aceita?',
    resposta: 'Aceitamos dinheiro, cartões de débito e crédito, Pix e outras formas de pagamento disponíveis na loja.',
  },
  {
    valor: 'item-3',
    pergunta: 'O Alô Pará possui aplicativo?',
    resposta: 'Sim! Com o nosso aplicativo você acompanha ofertas exclusivas, encartes atualizados e promoções em tempo real, direto no seu celular.',
  },
]
</script>

<template>
  <section class="border-t border-[#1a1a1a] px-6 md:px-10 py-20">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center gap-4 mb-12">
        <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Dúvidas</span>
        <div class="flex-1 h-px bg-[#1f1f1f]" />
      </div>

      <h2 class="text-white font-black text-[clamp(28px,4vw,40px)] leading-tight tracking-tight mb-8">
        Perguntas frequentes
      </h2>

      <Accordion type="single" collapsible default-value="" class="flex flex-col gap-2">
        <AccordionItem
          v-for="item in perguntas"
          :key="item.valor"
          :value="item.valor"
          class="bg-[#161616] border border-[#1f1f1f] rounded-xl px-5 data-[state=open]:border-red-600/50 transition-colors"
        >
          <AccordionTrigger class="text-[14px] md:text-[15px] font-bold text-white text-left py-4">
            {{ item.pergunta }}
          </AccordionTrigger>
          <AccordionContent class="pb-4">
            <p class="text-[13px] text-[#888] leading-relaxed">
              {{ item.resposta }}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>
