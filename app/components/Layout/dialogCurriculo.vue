<script setup lang="ts">
import { ref } from "vue"
import Button from '../ui/button/Button.vue'
import Dialog from '../ui/dialog/Dialog.vue'

const Nome = ref("")
const Numero = ref("")
const Mensagem = ref("")


const numeroCV = "559492268984"


function Enviar(){


const Curriculo = `
Olá! Meu nome é ${Nome.value}

${Mensagem.value}


`

const url =
`https://wa.me/${numeroCV}?text=${encodeURIComponent(Curriculo)}`

window.open(url, "_blank")
}
</script>

<template>
<div>
  <Dialog>
    
    <DialogTrigger as-child>
      <Button class="mt-7 p-6 md:p-7 text-[13px] md:text-[18px]">
        Formulario
      </Button>
    </DialogTrigger>

    <DialogContent class="w-[50%] bg-slate-50 flex justify-center">

      <div class="w-[90%] flex flex-col">
        
        <h4 class="text-[25px] font-semibold text-slate-900">
          Enviar currículo
        </h4>

        <div class="flex justify-between">

          <div class="w-[50%]">
            <p class="text-slate-500 font-light">Nome:</p>
            <input
              v-model="Nome"
              class="border-slate-300 text-[22px] border text-slate-900 w-[90%] p-3 rounded-[10px]"
              type="text"
            >
          </div>

          <div class="w-[50%]">
            <p class="text-slate-500 font-light">Numero:</p>
            <input
              v-model="Numero"
              class="border-slate-300 text-[22px] border text-slate-900 w-[90%] p-3 rounded-[10px]"
              type="number"
            >
          </div>

        </div>

        <div class="flex flex-col justify-center items-center m-5">

          <p class="text-slate-500 font-light">Fale sobre você:</p>

          <textarea
            v-model="Mensagem"
            class="border-slate-300 h-20 resize-none text-[17px] border text-slate-900 w-[70%] p-3 rounded-[10px]"
          ></textarea>

        </div>




        <Button
          @click="Enviar"
          class="m-10 p-7 font-bold text-[20px] bg-green-400 hover:bg-green-300"
        >
          Enviar currículo
        </Button>

      </div>

    </DialogContent>

  </Dialog>
</div>
</template>