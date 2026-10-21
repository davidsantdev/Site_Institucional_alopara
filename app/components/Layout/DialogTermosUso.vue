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
      <button type="button" class="text-[13px] text-(--texto-fraco) transition-colors hover:text-(--texto-primario)">
        Termos de uso
      </button>
    </DialogTrigger>

    <DialogContent class="flex max-h-[85vh] w-[92vw] flex-col overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) p-0 md:w-140">
      <div class="shrink-0 border-b border-(--borda) px-7 pb-5 pt-7">
        <span class="text-xs font-semibold uppercase tracking-wide text-red-600">Alô Pará</span>
        <h2 class="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-(--texto-primario)">
          Termos de uso
        </h2>
        <p class="mt-1.5 text-xs text-(--texto-fraco)">
          Última atualização: julho de 2026
        </p>
      </div>

      <div class="flex flex-col gap-6 overflow-y-auto px-7 py-6">
        <section v-for="bloco in blocos" :key="bloco.titulo">
          <h3 class="mb-1.5 text-sm font-bold text-(--texto-primario)">
            {{ bloco.titulo }}
          </h3>
          <p class="text-sm leading-relaxed text-(--texto-esmaecido)">
            {{ bloco.texto }}
          </p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>
