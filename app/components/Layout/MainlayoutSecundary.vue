<script setup lang="ts">
import Produtos from './Produtos.vue'
import ProdutosRedondo from './ProdutosRedondo.vue'

const stats = [
  { num: '+22', label: 'Anos de história' },
  { num: '40k', label: 'Clientes atendidos' },
  { num: '+1200', label: 'Produtos' },
]

const acoes = [
  'Bingos comunitários',
  'Feirão 48 Horas',
  'Sorteio de casa mobiliada',
  'Campanhas sazonais',
]
</script>

<template>
  <div class="bg-(--bg-cartao)">
    <!-- produtos -->
    <div class="bg-(--bg-cartao)">
      <Produtos />
    </div>

    <!-- SEÇÃO SOBRE -->
    <section id="Sobre" class="border-t border-(--borda) px-6 md:px-10 py-20">
      <div class="max-w-6xl mx-auto">
        <!-- label -->
        <div class="flex items-center gap-4 mb-14">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Nossa história</span>
          <div class="flex-1 h-px bg-(--borda)" />
        </div>

        <div class="grid md:grid-cols-2 gap-12 items-center">
          <!-- texto -->
          <div>
            <h2 class="text-(--texto-primario) font-black text-[clamp(36px,6vw,64px)] leading-none tracking-tight mb-6">
              Conheça<br>
              <span class="text-red-600">a nossa</span><br>
              história
            </h2>
            <p class="text-(--texto-suave) text-[14px] leading-relaxed mb-8">
              Fundado em 2004, o Alô Pará completa 22 anos fazendo parte da história
              e da mesa das famílias da nossa região. Mais do que um supermercado,
              somos um parceiro do dia a dia, construído com confiança, respeito e
              compromisso com cada cliente.
            </p>
            <p class="text-(--texto-minimo) text-[14px] leading-relaxed">
              Ao longo dessas duas décadas, crescemos junto com a comunidade,
              sempre mantendo o que é mais importante: preço justo, qualidade
              e atendimento de verdade.
            </p>

            <!-- stats -->
            <div class="grid grid-cols-3 gap-3 mt-10">
              <div
                v-for="s in stats"
                :key="s.num"
                class="bg-(--bg-cartao) border border-(--borda) rounded-xl p-4 flex flex-col gap-1"
              >
                <span class="text-(--texto-primario) text-[22px] font-black leading-none">
                  <span class="text-red-600">{{ s.num }}</span>
                </span>
                <span class="text-(--texto-minimo) text-[10px] font-bold tracking-[1.5px] uppercase">{{ s.label }}</span>
              </div>
            </div>
          </div>

          <!-- imagem -->
          <div class="relative">
            <div class="absolute -inset-[1px] rounded-2xl border border-red-600/10" />
            <img
              src="../../assets/img/image 954.png"
              alt="Alô Pará"
              class="w-full rounded-2xl object-cover brightness-75"
            >
            <!-- badge flutuante -->
            <div class="absolute bottom-5 left-5 bg-(--bg-cartao)/90 border border-(--borda-forte) rounded-xl px-4 py-3">
              <p class="text-red-600 text-[10px] font-black tracking-[2px] uppercase">
                Desde
              </p>
              <p class="text-(--texto-primario) text-[22px] font-black leading-none">
                2004
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIAS -->
    <section class="border-t border-(--borda) px-6 md:px-10 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-12">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">O que oferecemos</span>
          <div class="flex-1 h-px bg-(--borda)" />
        </div>
        <ProdutosRedondo />
      </div>
    </section>

    <!-- TRABALHO SOCIAL -->
    <section class="border-t border-(--borda) px-6 md:px-10 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-14">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Responsabilidade social</span>
          <div class="flex-1 h-px bg-(--borda)" />
        </div>

        <div class="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 class="text-(--texto-primario) font-black text-[clamp(28px,5vw,48px)] leading-tight tracking-tight mb-6">
              Nosso<br>
              <span class="text-red-600">trabalho</span><br>
              social
            </h2>
            <p class="text-(--texto-suave) text-[14px] leading-relaxed mb-6">
              No Alô Pará, o trabalho social integra nossa atuação de forma responsável
              e contínua. Entendemos que nosso papel vai além da atividade comercial,
              envolvendo também o compromisso com o desenvolvimento social e o
              fortalecimento da comunidade.
            </p>
            <p class="text-(--texto-minimo) text-[14px] leading-relaxed">
              Buscamos incentivar o engajamento, proporcionar oportunidades e
              contribuir de maneira concreta para o bem-estar das famílias da nossa região.
            </p>
          </div>

          <!-- ações sociais -->
          <div class="flex flex-col gap-3">
            <p class="text-[10px] font-black tracking-[3px] uppercase text-(--texto-minimo) mb-1">
              Iniciativas realizadas
            </p>
            <div
              v-for="(acao, i) in acoes"
              :key="acao"
              class="flex items-center gap-4 bg-(--bg-cartao) border border-(--borda) rounded-xl px-5 py-4 group hover:border-red-600 transition-colors duration-200"
            >
              <span class="text-red-600 text-[11px] font-black tracking-[2px] shrink-0">0{{ i + 1 }}</span>
              <div class="w-px h-4 bg-(--borda-forte)" />
              <span class="text-(--texto-esmaecido) text-[14px] font-semibold group-hover:text-(--texto-primario) transition-colors duration-200">{{ acao }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
