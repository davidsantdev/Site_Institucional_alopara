<script setup lang="ts">
import { LogOut, Search, Trash2, Upload } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { imagemErro, imgSrc } from '~/composables/useCatalogo'

// Página de uso interno — nunca deve ser indexada nem seguida pelo Google.
useSeoMeta({
  title: 'Painel | Alô Pará',
  robots: 'noindex, nofollow',
})

type Tela = 'carregando' | 'login' | 'painel'
const tela = ref<Tela>('carregando')

// ═════════════ LOGIN ═════════════

const senha = ref('')
const erroLogin = ref('')
const entrando = ref(false)

async function verificarSessao() {
  try {
    const r = await $fetch<{ autenticado: boolean }>('/api/admin/sessao')
    tela.value = r.autenticado ? 'painel' : 'login'
  }
  catch {
    tela.value = 'login'
  }
}

async function entrar() {
  erroLogin.value = ''
  entrando.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { senha: senha.value } })
    senha.value = ''
    tela.value = 'painel'
  }
  catch (e: any) {
    erroLogin.value = e?.data?.statusMessage || 'Não foi possível entrar'
  }
  finally {
    entrando.value = false
  }
}

async function sair() {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  tela.value = 'login'
}

// ═════════════ BUSCA ═════════════

interface ProdutoAdmin {
  id: string
  nome: string
  preco2: string
  tipo: string
  img: string
}

const busca = ref('')
const produtos = ref<ProdutoAdmin[]>([])
const buscando = ref(false)
let timeoutBusca: ReturnType<typeof setTimeout> | null = null

async function executarBusca() {
  if (!busca.value.trim()) {
    produtos.value = []
    return
  }
  buscando.value = true
  try {
    const r = await $fetch<{ produtos: ProdutoAdmin[] }>('/api/admin/produtos', { query: { busca: busca.value } })
    produtos.value = r.produtos
  }
  catch {
    toast.error('Erro ao buscar produtos')
  }
  finally {
    buscando.value = false
  }
}

function aoDigitarBusca() {
  if (timeoutBusca)
    clearTimeout(timeoutBusca)
  timeoutBusca = setTimeout(executarBusca, 400)
}

// ═════════════ IMAGEM POR PRODUTO ═════════════

const enviando = ref<Record<string, boolean>>({})

async function enviarImagem(produto: ProdutoAdmin, arquivo: File) {
  enviando.value[produto.id] = true
  try {
    const form = new FormData()
    form.append('imagem', arquivo)
    const r = await $fetch<{ imagem: string }>(`/api/admin/produtos/${produto.id}/imagem`, {
      method: 'POST',
      body: form,
    })
    produto.img = r.imagem
    toast.success('Imagem atualizada', { description: produto.nome })
  }
  catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Erro ao enviar imagem')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

function aoEscolherArquivo(produto: ProdutoAdmin, evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivo = input.files?.[0]
  if (arquivo)
    enviarImagem(produto, arquivo)
  input.value = '' // permite escolher o mesmo arquivo de novo depois, se precisar
}

async function removerImagem(produto: ProdutoAdmin) {
  enviando.value[produto.id] = true
  try {
    await $fetch(`/api/admin/produtos/${produto.id}/imagem`, { method: 'DELETE' })
    toast.success('Imagem removida — voltou ao automático', { description: produto.nome })
    await executarBusca() // recarrega pra refletir a imagem automática atual
  }
  catch {
    toast.error('Erro ao remover imagem')
  }
  finally {
    enviando.value[produto.id] = false
  }
}

onMounted(verificarSessao)
</script>

<template>
  <div class="min-h-screen bg-[#111111] font-sans text-white">
    <!-- carregando -->
    <div v-if="tela === 'carregando'" class="flex min-h-screen items-center justify-center text-[#555]">
      Carregando...
    </div>

    <!-- login -->
    <div v-else-if="tela === 'login'" class="flex min-h-screen items-center justify-center px-4">
      <form class="w-full max-w-sm rounded-2xl border border-[#1f1f1f] bg-[#161616] p-8" @submit.prevent="entrar">
        <h1 class="mb-1 text-xl font-black">
          <span class="text-red-600">Alô</span> Pará — Admin
        </h1>
        <p class="mb-6 text-sm text-[#666]">
          Painel de edição de produtos
        </p>

        <label for="senha" class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#888]">Senha</label>
        <input
          id="senha"
          v-model="senha"
          type="password"
          autofocus
          class="mb-4 h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] px-4 text-white outline-none transition focus:border-red-600"
          placeholder="••••••••"
        >

        <p v-if="erroLogin" class="mb-4 text-sm text-red-500">
          {{ erroLogin }}
        </p>

        <button
          type="submit"
          :disabled="entrando || !senha"
          class="flex h-12 w-full items-center justify-center rounded-xl bg-red-600 font-bold transition hover:bg-red-700 disabled:opacity-40"
        >
          {{ entrando ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>

    <!-- painel -->
    <div v-else class="mx-auto max-w-5xl px-4 py-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black">
            <span class="text-red-600">Alô</span> Pará — Admin
          </h1>
          <p class="text-sm text-[#666]">
            Editar foto de produto
          </p>
        </div>
        <button
          class="flex items-center gap-2 rounded-lg border border-[#2a2a2a] px-3 py-2 text-sm text-[#888] transition hover:border-red-600 hover:text-white"
          @click="sair"
        >
          <LogOut :size="14" /> Sair
        </button>
      </div>

      <div class="relative mb-6">
        <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" :size="18" />
        <input
          v-model="busca"
          type="search"
          placeholder="Buscar produto por nome..."
          class="h-12 w-full rounded-xl border border-[#2a2a2a] bg-[#161616] pl-12 pr-4 text-white outline-none transition focus:border-red-600"
          @input="aoDigitarBusca"
        >
      </div>

      <p v-if="buscando" class="text-sm text-[#555]">
        Buscando...
      </p>
      <p v-else-if="busca && produtos.length === 0" class="text-sm text-[#555]">
        Nenhum produto encontrado.
      </p>

      <div class="flex flex-col gap-2">
        <div
          v-for="p in produtos"
          :key="p.id"
          class="flex items-center gap-4 rounded-xl border border-[#1f1f1f] bg-[#161616] p-3"
        >
          <img
            :src="imgSrc(p.img)"
            :alt="p.nome"
            class="h-16 w-16 shrink-0 rounded-lg bg-white object-contain p-1"
            @error="imagemErro"
          >

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">
              {{ p.nome }}
            </p>
            <p class="text-xs text-[#666]">
              {{ p.tipo }} · R$ {{ p.preco2 }}
            </p>
          </div>

          <label
            class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3 py-2 text-xs font-semibold text-[#ccc] transition hover:border-red-600 hover:text-white"
            :class="{ 'pointer-events-none opacity-40': enviando[p.id] }"
          >
            <Upload :size="14" />
            {{ enviando[p.id] ? 'Enviando...' : 'Trocar foto' }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="aoEscolherArquivo(p, $event)"
            >
          </label>

          <button
            title="Remover foto escolhida (volta ao automático)"
            class="shrink-0 rounded-lg border border-[#2a2a2a] p-2 text-[#555] transition hover:border-red-600 hover:text-red-500 disabled:opacity-40"
            :disabled="enviando[p.id]"
            @click="removerImagem(p)"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
