<script setup lang="ts">
import Dialog from '../ui/dialog/Dialog.vue'
import DialogContent from '../ui/dialog/DialogContent.vue'
import DialogTrigger from '../ui/dialog/DialogTrigger.vue'

const blocos = [
  {
    titulo: '1. Quais dados coletamos',
    texto: 'Coletamos apenas o necessário para atender seu pedido: nome, número de WhatsApp e os itens do carrinho quando você finaliza uma compra pelo site. Ao enviar seu currículo, também coletamos as informações que você mesmo digita no formulário.',
  },
  {
    titulo: '2. Como usamos essas informações',
    texto: 'Usamos esses dados exclusivamente para processar seu pedido junto à nossa equipe (via WhatsApp) e para contato do setor de Recursos Humanos, no caso de candidaturas. Não usamos seus dados para nenhuma outra finalidade.',
  },
  {
    titulo: '3. Carrinho e armazenamento local',
    texto: 'Os itens do seu carrinho ficam salvos apenas no seu próprio navegador (localStorage), para que você não os perca ao navegar pelo site. Essa informação não é enviada aos nossos servidores até você decidir finalizar o pedido.',
  },
  {
    titulo: '4. Compartilhamento com terceiros',
    texto: 'Não vendemos nem compartilhamos seus dados com terceiros para fins comerciais. Instagram e WhatsApp são operados pela Meta; ao clicar nesses links, você passa a estar sujeito às políticas de privacidade dessas plataformas.',
  },
  {
    titulo: '5. Seus direitos (LGPD)',
    texto: 'Você pode solicitar a qualquer momento a confirmação, correção ou exclusão dos seus dados conosco, entrando em contato pelo nosso WhatsApp. Levamos sua privacidade a sério e respondemos a todas as solicitações.',
  },
  {
    titulo: '6. Alterações nesta política',
    texto: 'Esta política pode ser atualizada periodicamente para refletir melhorias no site ou mudanças legais. Recomendamos revisitar esta página de tempos em tempos.',
  },
]
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button type="button" class="text-[#2a2a2a] text-[11px] font-bold tracking-[1px] hover:text-[#555] transition-colors">
        Política de privacidade
      </button>
    </DialogTrigger>

    <DialogContent class="bg-[#111] border border-[#1f1f1f] p-0 w-[92vw] md:w-[560px] max-h-[85vh] overflow-hidden rounded-2xl flex flex-col">
      <!-- header -->
      <div class="px-7 pt-7 pb-5 border-b border-[#1a1a1a] shrink-0">
        <span class="text-red-600 text-[10px] font-black tracking-[3px] uppercase">Alô Pará</span>
        <h2 class="text-white text-[22px] font-black tracking-tight mt-1 leading-none">
          Política de privacidade
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
