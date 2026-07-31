/**
 * Vitrines da home (abas "Melhores produtos" / "Bebidas").
 *
 * Antes usavam um JSON estático local, cheio de produtos sem imagem real
 * (a maioria caía no ícone de "sem imagem"). Agora buscam do mesmo catálogo
 * vivo das páginas de categoria (`/api/alimentos`, `/api/bebidas`, etc.) e
 * descartam qualquer produto cuja imagem não carregue de verdade — só entra
 * na vitrine quem tem foto de fato.
 */
import { onMounted, ref } from 'vue'

export interface ProdutoVitrine {
  id: string
  nome: string
  preco2: string
  tipo: string
  img: string
  quantidade: number
}

/** Resolve `true` só se a imagem carregar de verdade (evita o placeholder quebrado). */
function imagemCarrega(url: string | undefined, timeoutMs = 4000): Promise<boolean> {
  if (!url?.trim())
    return Promise.resolve(false)

  return new Promise((resolve) => {
    const img = new Image()
    let resolvido = false
    const finalizar = (ok: boolean) => {
      if (resolvido)
        return
      resolvido = true
      resolve(ok)
    }

    img.onload = () => finalizar(true)
    img.onerror = () => finalizar(false)
    img.src = url
    setTimeout(() => finalizar(false), timeoutMs)
  })
}

export function useVitrine(endpoint: string, opcoes: { busca?: string, limite?: number } = {}) {
  const limite = opcoes.limite ?? 5
  const produtos = ref<ProdutoVitrine[]>([])
  const carregando = ref(true)

  async function carregar() {
    carregando.value = true
    try {
      const res = await $fetch<any>(endpoint, {
        query: opcoes.busca ? { busca: opcoes.busca } : undefined,
      })
      const candidatos: ProdutoVitrine[] = res?.produtos ?? []

      const validos = await Promise.all(candidatos.map(async p => ({
        produto: p,
        ok: await imagemCarrega(p.img),
      })))

      produtos.value = validos
        .filter(v => v.ok)
        .slice(0, limite)
        .map(v => ({ ...v.produto, quantidade: 1 }))
    }
    catch (e) {
      console.error(e)
      produtos.value = []
    }
    finally {
      carregando.value = false
    }
  }

  // Só faz sentido no cliente: precisa do carregamento real da imagem no navegador.
  onMounted(carregar)

  return { produtos, carregando }
}
