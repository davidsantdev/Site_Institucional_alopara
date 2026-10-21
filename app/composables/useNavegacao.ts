/**
 * Categorias da loja e dados de contato num lugar só — header, menu mobile,
 * rodapé e a vitrine de categorias da home liam cada um a sua própria lista
 * (e já estavam divergindo: a home ainda não tinha Hortifruti nem Carnes).
 */
import type { Component } from 'vue'
import { Apple, Beef, CupSoda, Newspaper, ShoppingBasket, Sparkles, SprayCan, Tag } from 'lucide-vue-next'
import catAlimentos from '~/assets/img/web/cat-alimentos.webp'
import catBebidas from '~/assets/img/web/cat-bebidas.webp'
import catCarnes from '~/assets/img/web/cat-carnes.webp'
import catLimpeza from '~/assets/img/web/cat-limpeza.webp'
import catPerfumaria from '~/assets/img/web/cat-perfumaria.webp'

export interface CategoriaLoja {
  label: string
  /** Texto curto embaixo do nome (vitrine da home). */
  descricao: string
  rota: string
  icone: Component
  /** Ilustração da vitrine — sem ela, emojis (hortifruti) ou o próprio ícone, grande. */
  imagem?: string
  emojis?: string[]
  /** Fundo do círculo atrás da ilustração (classe completa, pro Tailwind enxergar). */
  fundo: string
}

export const CATEGORIAS_LOJA: CategoriaLoja[] = [
  { label: 'Ofertas', descricao: 'Preço de clube', rota: '/ofertas', icone: Tag, fundo: 'bg-red-500/12' },
  { label: 'Hortifruti', descricao: 'Frutas e verduras', rota: '/frutas', icone: Apple, emojis: ['🍌', '🍎', '🥬'], fundo: 'bg-lime-500/15' },
  { label: 'Carnes e frios', descricao: 'Açougue e frios', rota: '/carnes', icone: Beef, imagem: catCarnes, fundo: 'bg-rose-500/12' },
  { label: 'Alimentos', descricao: 'Mercearia', rota: '/alimentos', icone: ShoppingBasket, imagem: catAlimentos, fundo: 'bg-orange-500/12' },
  { label: 'Bebidas', descricao: 'Sucos, cervejas e mais', rota: '/bebidas', icone: CupSoda, imagem: catBebidas, fundo: 'bg-sky-500/12' },
  { label: 'Limpeza', descricao: 'Casa e lavanderia', rota: '/limpeza', icone: SprayCan, imagem: catLimpeza, fundo: 'bg-blue-500/12' },
  { label: 'Perfumaria', descricao: 'Higiene e beleza', rota: '/perfumaria', icone: Sparkles, imagem: catPerfumaria, fundo: 'bg-pink-500/12' },
]

export const LINK_ENCARTES = { label: 'Encartes', rota: '/encartes', icone: Newspaper }

export const CONTATO = {
  whatsapp: '5594991923141',
  whatsappFormatado: '(94) 99192-3141',
  instagram: 'https://instagram.com/supermercadoalopara',
  instagramUsuario: '@supermercadoalopara',
  /** Mesmo horário nas duas lojas (Matriz e Filial) — ver as perguntas frequentes. */
  horario: 'Seg a sáb, 7h às 21h · Dom, 7h às 12h30',
  horarioCurto: 'Seg–sáb 7h–21h · Dom 7h–12h30',
  cidade: 'Novo Repartimento - PA',
  clube: 'https://cadastramento-alopara.mercafacil.com/home',
  appAndroid: 'https://play.google.com/store/apps/details?id=inovatech.mercafacil.supmercado.alo.para&hl=pt_BR',
  appIos: 'https://apps.apple.com/br/app/supermercado-al%C3%B4-par%C3%A1/id6737360207',
}

/** Link de conversa no WhatsApp, já com a mensagem escrita. */
export function linkWhatsapp(mensagem = 'Olá! Vim pelo site do Alô Pará.'): string {
  return `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
