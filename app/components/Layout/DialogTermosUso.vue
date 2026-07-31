<script setup lang="ts">
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

const blocos = [
  {
    titulo: '1. Sobre o site',
    texto: 'Este site é um canal informativo e de catálogo do Supermercado Alô Pará. Ele não processa pagamentos online: os pedidos feitos por aqui são finalizados via WhatsApp, diretamente com nossa equipe.',
  },
  {
    titulo: '2. Preços e disponibilidade',
    texto: 'Os preços e produtos exibidos são atualizados regularmente, mas podem sofrer alterações sem aviso prévio e divergir do praticado na loja física no momento da compra. A disponibilidade em estoque é confirmada apenas no fechamento do pedido.',
  },
  {
    titulo: '3. Pedidos via WhatsApp',
    texto: 'Ao clicar em "Finalizar no WhatsApp", uma mensagem com os itens do seu carrinho é montada automaticamente. O pedido só é considerado confirmado após o retorno da nossa equipe, que pode ajustar valores, formas de pagamento e prazos.',
  },
  {
    titulo: '4. Propriedade intelectual',
    texto: 'A marca, o logotipo e o conteúdo deste site pertencem ao Supermercado Alô Pará. As imagens de produtos são fornecidas pelos respectivos fabricantes/distribuidores e usadas apenas para fins ilustrativos.',
  },
  {
    titulo: '5. Uso adequado',
    texto: 'Pedimos que o site seja utilizado de boa-fé, sem tentativas de acesso indevido, automação abusiva ou qualquer uso que possa prejudicar sua disponibilidade para os demais clientes.',
  },
  {
    titulo: '6. Alterações nestes termos',
    texto: 'Estes termos podem ser atualizados periodicamente. O uso contínuo do site após alterações representa a aceitação da versão vigente.',
  },
]
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button type="button" class="text-[#2a2a2a] text-[11px] font-bold tracking-[1px] hover:text-[#555] transition-colors">
        Termos de uso
      </button>
    </DialogTrigger>

    <DialogContent class="bg-[#111] border border-[#1f1f1f] p-0 w-[92vw] md:w-[560px] max-h-[85vh] overflow-hidden rounded-2xl flex flex-col">
      <!-- header -->
      <div class="px-7 pt-7 pb-5 border-b border-[#1a1a1a] shrink-0">
        <span class="text-red-600 text-[10px] font-black tracking-[3px] uppercase">Alô Pará</span>
        <h2 class="text-white text-[22px] font-black tracking-tight mt-1 leading-none">
          Termos de uso
        </h2>
        <p class="text-[#444] text-[12px] mt-2">
          Última atualização: julho de 2026
        </p>
      </div>

      <!-- corpo rolável -->
      <div class="px-7 py-6 overflow-y-auto flex flex-col gap-6">
        <section v-for="bloco in blocos" :key="bloco.titulo">
          <h3 class="text-white text-[14px] font-bold mb-2">
            {{ bloco.titulo }}
          </h3>
          <p class="text-[#888] text-[13px] leading-relaxed">
            {{ bloco.texto }}
          </p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>
