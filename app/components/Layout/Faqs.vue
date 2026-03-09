<script setup lang="ts">
import Accordion from '../ui/accordion/Accordion.vue';
import AccordionContent from '../ui/accordion/AccordionContent.vue';
import AccordionItem from '../ui/accordion/AccordionItem.vue';
import AccordionTrigger from '../ui/accordion/AccordionTrigger.vue';
import Footer from './Footer.vue';

</script>

<template>
    <div class="flex flex-col bg-[#121212]  justify-center items-center center pt-20">
      <h4 class="text-[30px] text-white">Perguntas Frequentes</h4>
        <Accordion type="single" collapsible class="md:w-[50%] text-center p-1" default-value="">
    <AccordionItem value="item-1">
      <AccordionTrigger class="text-[20px] text-center text-white">Quais são os horários de funcionamento do Alô Pará?</AccordionTrigger>
      <AccordionContent>
        <p class="text-[18px] text-slate-200 font-light">
          Nossas lojas funcionam em horário comercial, podendo variar conforme a unidade. Para saber o horário 
          atualizado, consulte nossa página de contato ou nossas redes sociais
        </p>
      
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2">
      <AccordionTrigger class="text-[20px] text-center text-white ">Quais formas de pagamento o supermercado aceita?</AccordionTrigger>
      <AccordionContent>
        <p class="text-[18px] text-slate-200 font-light">
          Aceitamos dinheiro, cartões de débito e 
          crédito, Pix e outras formas de pagamento disponíveis na loja.
        </p>
        
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-3">
      <AccordionTrigger  class="text-[20px] text-center text-white">O Alô Pará possui aplicativo?</AccordionTrigger>
      <AccordionContent>
        <p class="text-[18px] text-slate-200 font-light ">
          Sim! Com o nosso aplicativo você acompanha ofertas exclusivas, encartes atualizados e promoções em tempo real, direto no seu celular.
        </p>
        
      </AccordionContent>
    </AccordionItem>
  </Accordion>

  
    </div>



</template>