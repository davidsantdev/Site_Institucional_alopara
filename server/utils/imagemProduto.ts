/**
 * Grava a foto escolhida pelo admin pra um produto — usada pelo upload manual
 * (imagem.post.ts) e pela importação do banco de fotos (imagem-pexels.post.ts).
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { definirOverrideImagem, UPLOADS_DIR } from './catalogo'

export const TIPOS_IMAGEM_ACEITOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** Foto de produto não precisa de mais que isso. */
export const TAMANHO_MAX_IMAGEM = 5 * 1024 * 1024

/** Salva o arquivo, troca a foto do produto no catálogo publicado e devolve a URL pública. */
export async function salvarImagemProduto(produtoId: string, dados: Uint8Array, extensao: string): Promise<string> {
  await mkdir(UPLOADS_DIR, { recursive: true })

  // ID vira nome de arquivo — sanitizado pra nunca escapar da pasta de uploads.
  const idSeguro = produtoId.replace(/[^\w-]/g, '_')

  // Remove qualquer versão anterior (mesmo com outra extensão) antes de salvar a nova,
  // pra nunca acumular lixo em disco quando o admin troca a foto várias vezes.
  const existentes = await readdir(UPLOADS_DIR).catch(() => [])
  await Promise.all(
    existentes
      .filter(f => f.startsWith(`${idSeguro}.`))
      .map(f => rm(join(UPLOADS_DIR, f)).catch(() => {})),
  )

  const nomeArquivo = `${idSeguro}.${extensao}`
  await writeFile(join(UPLOADS_DIR, nomeArquivo), dados)

  // Nome de arquivo é estável (some/reaparece igual se reenviado) — o `?v=`
  // é só pra não ficar preso em cache do navegador mostrando a foto antiga.
  const url = `/uploads/${nomeArquivo}?v=${Date.now()}`
  await definirOverrideImagem(produtoId, url)
  return url
}
