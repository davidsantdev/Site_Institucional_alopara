/**
 * Modo claro/escuro do site. Estado é um ref de módulo (não por componente)
 * de propósito — o botão do header (desktop) e o do menu mobile precisam
 * mostrar sempre o mesmo estado, sem duplicar a leitura do localStorage.
 */
import { onMounted, ref } from 'vue'

const CHAVE_STORAGE = 'alopara-tema'
type Tema = 'escuro' | 'claro'

const tema = ref<Tema>('escuro')
let inicializado = false

function aplicar(valor: Tema) {
  if (typeof document !== 'undefined')
    document.documentElement.classList.toggle('claro', valor === 'claro')
}

export function useTema() {
  onMounted(() => {
    // Só lê uma vez por carregamento de página — chamadas seguintes (outro
    // componente montando) não devem sobrescrever uma alternância que já aconteceu.
    if (inicializado)
      return
    inicializado = true
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE)
      if (salvo === 'claro')
        tema.value = 'claro'
      // O <html class="claro"> já foi aplicado antes do paint pelo script
      // inline em app.vue — não precisa reaplicar aqui, só sincronizar o ref.
    }
    catch {
      // localStorage indisponível (modo privado, cookies bloqueados) — segue no escuro padrão.
    }
  })

  function alternar() {
    tema.value = tema.value === 'escuro' ? 'claro' : 'escuro'
    aplicar(tema.value)
    try {
      localStorage.setItem(CHAVE_STORAGE, tema.value)
    }
    catch {
      // Sem storage: a escolha vale só pra esta navegação, não persiste — aceitável.
    }
  }

  return { tema, alternar }
}
