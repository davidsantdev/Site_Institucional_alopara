<script setup lang="ts">
import equipeImg from '~/assets/img/func.png'
import lojaImg from '~/assets/img/qualidade.jpg'
import DialogCurriculo from './dialogCurriculo.vue'

const diferenciais = [
  { num: '01', titulo: 'Equipe unida', desc: 'Trabalhamos em time, valorizamos cada pessoa e celebramos conquistas juntos.' },
  { num: '02', titulo: 'Crescimento real', desc: 'Valorizamos quem se dedica. Muitos dos nossos líderes começaram no operacional.' },
  { num: '03', titulo: 'Ambiente saudável', desc: 'Respeito, transparência e boa comunicação fazem parte do nosso dia a dia.' },
]
</script>

<template>
  <div class="bg-[#111]">
    <!-- HERO -->
    <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 py-24">
      <div class="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600 opacity-[0.05] rounded-full pointer-events-none" />

      <div class="relative z-10 max-w-5xl w-full flex flex-col md:flex-row items-center gap-14">
        <div class="flex-1">
          <span class="inline-block bg-red-600 text-white text-[10px] font-black tracking-[3px] uppercase px-4 py-1.5 mb-6">
            Trabalhe conosco
          </span>

          <h1 class="text-white font-black text-[clamp(42px,8vw,80px)] leading-none tracking-tight mb-6">
            Junte-se<br>
            <span class="text-red-600">à nossa</span><br>
            equipe
          </h1>

          <p class="text-[#666] text-[15px] leading-relaxed max-w-md mb-10">
            No Alô Pará, acreditamos que nosso maior patrimônio são as pessoas.
            Se você é dedicado e quer crescer profissionalmente, venha fazer
            parte da nossa família.
          </p>

          <div class="flex gap-4 flex-wrap">
            <DialogCurriculo />
            <a href="#vagas">
              <button class="border-2 border-[#2a2a2a] text-[#888] hover:border-red-600 hover:text-white font-bold text-[13px] tracking-widest uppercase px-7 py-[14px] transition-all duration-200">
                Saiba mais
              </button>
            </a>
          </div>
        </div>

        <div class="flex-1 hidden md:flex justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-red-600 opacity-10 rounded-2xl translate-x-3 translate-y-3" />
            <img
              :src="equipeImg"
              alt="Equipe do Supermercado Alô Pará em evento comunitário"
              class="relative w-full max-w-[400px] rounded-2xl object-cover"
            >
          </div>
        </div>
      </div>
    </section>

    <!-- DIFERENCIAIS -->
    <section class="border-t border-[#1a1a1a] px-6 py-20">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center gap-4 mb-12">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Por que trabalhar aqui</span>
          <div class="flex-1 h-px bg-[#1f1f1f]" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="d in diferenciais"
            :key="d.num"
            class="bg-[#161616] border border-[#1f1f1f] rounded-xl p-7 flex flex-col gap-5 hover:border-red-600 transition-colors duration-300 group"
          >
            <span class="text-[11px] font-black tracking-[3px] text-red-600 uppercase">{{ d.num }}</span>

            <div>
              <h3 class="text-white text-[20px] font-black tracking-tight mb-2">
                {{ d.titulo }}
              </h3>
              <div class="w-6 h-[2px] bg-red-600 mb-4 transition-all duration-300 group-hover:w-12" />
              <p class="text-[#555] text-[13px] leading-relaxed">
                {{ d.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VAGAS -->
    <section id="vagas" class="border-t border-[#1a1a1a] px-6 py-20">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center gap-4 mb-12">
          <span class="text-red-600 text-[10px] font-black tracking-[4px] uppercase">Vagas disponíveis</span>
          <div class="flex-1 h-px bg-[#1f1f1f]" />
        </div>

        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 class="text-white font-black text-[clamp(28px,5vw,48px)] leading-tight tracking-tight mb-5">
              Onde encontrar<br>
              <span class="text-red-600">nossas oportunidades?</span>
            </h2>

            <p class="text-[#555] text-[14px] leading-relaxed mb-8">
              Nossas oportunidades são divulgadas oficialmente através do nosso
              Instagram e também pelo nosso WhatsApp. Fique de olho e candidate-se!
            </p>

            <div class="flex flex-col gap-3">
              <!-- INSTAGRAM -->
              <a
                href="https://instagram.com/supermercadoalopara"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-4 bg-[#161616] border border-[#1f1f1f] rounded-xl px-5 py-4 hover:border-red-600 transition-colors duration-200 group"
              >
                <div class="w-9 h-9 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white text-[13px] font-bold">Instagram</p>
                  <p class="text-[#444] text-[11px]">@supermercadoalopara</p>
                </div>
              </a>

              <!-- WHATSAPP -->
              <a
                href="https://wa.me/559492268984"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-4 bg-[#161616] border border-[#1f1f1f] rounded-xl px-5 py-4 hover:border-red-600 transition-colors duration-200 group"
              >
                <div class="w-9 h-9 rounded-lg bg-red-600/10 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white text-[13px] font-bold">WhatsApp</p>
                  <p class="text-[#444] text-[11px]">Fale com o RH</p>
                </div>
              </a>
            </div>
          </div>

          <div class="relative hidden md:block">
            <img
              :src="lojaImg"
              alt="Fachada do Supermercado Alô Pará"
              class="rounded-2xl w-full object-cover brightness-75"
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
