# 🛒 Site Institucional + Encarte Digital – Alô Pará

## 👨‍💻 Desenvolvedor

**David Santos da Costa**

---

## 📌 Sobre o Projeto

Evolução do site institucional do **Alô Pará**, agora com **encarte digital completo**, **carrinho de compras** e **integração direta com WhatsApp**.

Além de apresentar a empresa, o sistema permite que o cliente **navegue por produtos, monte seu carrinho e finalize o pedido pelo WhatsApp**, tornando o site uma ferramenta prática de vendas.

---

## 🚀 Tecnologias Utilizadas

* Nuxt 3
* Vue 3
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* AOS (Animate On Scroll)

---

## 🎯 Funcionalidades

### 🛍️ Encarte Digital

* Listagem dinâmica de produtos via JSON
* Estrutura organizada por categorias
* Exibição de preços (incluindo casos com **2 preços**, ex: promoções por kg)
* Layout inspirado em encartes reais de supermercado

### 🛒 Carrinho de Compras

* Adição e remoção de produtos
* Contador dinâmico de itens
* Atualização reativa com `computed`
* Tratamento de carrinho vazio

### 📲 Integração com WhatsApp

* Geração automática da mensagem com os itens do carrinho
* Envio direto para o WhatsApp do supermercado
* Fluxo simples: **cliente escolhe → monta carrinho → envia pedido**

### 🎠 Interface Interativa

* Carousel de banners e produtos
* Animações com AOS
* Design responsivo (mobile-first)

### 💼 Trabalhe Conosco

* Página institucional de recrutamento
* Direcionamento para Instagram
* Contato via WhatsApp

### 🏷️ Clube de Ofertas

* Área dedicada a promoções
* Destaque de produtos estratégicos

### ❓ FAQ (Perguntas Frequentes)

* Respostas rápidas para dúvidas comuns

### 📲 Integrações

* WhatsApp (principal canal de conversão)
* Instagram (divulgação e vagas)

---

## 🧠 Lógica do Sistema

* Produtos vindos de arquivo JSON
* Uso de `v-for` para renderização
* Estado global/local do carrinho com Composition API
* Uso de `ref`, `computed` e `watch`
* Montagem dinâmica da mensagem para WhatsApp

---

## 📂 Estrutura do Projeto

```
my-dashboard-app/
 ├── assets/
 ├── components/
 ├── composables/
 │    └── useCarrinho.ts
 ├── data/
 │    └── produtosAlimentos.json
 ├── pages/
 ├── public/
 ├── app.vue
 └── nuxt.config.ts
```

---

## ⚙️ Como Rodar o Projeto

```bash
# Instalar dependências
npm install

# Rodar ambiente de desenvolvimento
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:3000
```

---

## 🌟 Objetivo

Criar uma solução digital que une:

* Presença institucional
* Divulgação de ofertas
* Conversão direta em vendas via WhatsApp

---

## 🔥 Diferenciais

* Sistema híbrido: institucional + e-commerce simplificado
* Foco em conversão real (WhatsApp)
* Estrutura pensada para uso em supermercado de verdade
* Escalável para futuras integrações (backend, banco de dados)

---

## 📌 Status

🚧 Em desenvolvimento

Melhorias em andamento:

* Persistência do carrinho
* Painel administrativo
* Integração com backend

---

## 📄 Licença

Projeto de uso institucional.
