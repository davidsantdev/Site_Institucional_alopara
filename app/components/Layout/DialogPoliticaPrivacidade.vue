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
      <button type="button" class="text-[13px] text-(--texto-fraco) transition-colors hover:text-(--texto-primario)">
        Política de privacidade
      </button>
    </DialogTrigger>

    <DialogContent class="flex max-h-[85vh] w-[92vw] flex-col overflow-hidden rounded-2xl border border-(--borda) bg-(--bg-cartao) p-0 md:w-140">
      <div class="shrink-0 border-b border-(--borda) px-7 pb-5 pt-7">
        <span class="text-xs font-semibold uppercase tracking-wide text-red-600">Alô Pará</span>
        <h2 class="mt-1 text-[22px] font-extrabold leading-tight tracking-tight text-(--texto-primario)">
          Política de privacidade
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
