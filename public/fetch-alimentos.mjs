// fetch-alimentos.mjs
import fs from 'fs';

const res = await fetch('https://aloparacim.dataciss.com.br:4665/cisspoder-service/get_produtos_sitemercado', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 5fdd85d6-1482-4c89-9f6b-eda495a37470'
  },
  body: JSON.stringify({ idLoja: '0001' })
});

const lista = await res.json();
const raw = Array.isArray(lista) ? lista : (lista.produtos || lista.data || []);

const FOOD_KEYS = ['ALIMENTO','MERCEARIA','BEBIDA','LATICÍNIO','ARROZ','FEIJÃO','FARINHA',
  'CAFÉ','AÇÚCAR','LEITE','ÓLEO','BISCOITO','MACARRÃO','MOLHO','CEREAIS'];

const alimentos = raw
  .filter(p => {
    const txt = [p.departamento, p.categoria, p.subcategoria, p.nome].join(' ').toUpperCase();
    return FOOD_KEYS.some(k => txt.includes(k));
  })
  .map((p, i) => ({
    id: p.plu || i + 1,
    nome: p.nome?.trim() || '',
    preço2: parseFloat(p.vlrProduto || 0).toFixed(2),
    tipo: (p.subcategoria || p.categoria || 'Alimentos').trim(),
    img: p.imageUrl || '',
    quantidade: 1
  }));

fs.writeFileSync('./produtosAlimentos.json', JSON.stringify(alimentos, null, 2));
console.log(`Salvo: ${alimentos.length} produtos`);