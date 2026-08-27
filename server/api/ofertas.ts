// Todos os produtos com preço de clube ativo, de qualquer categoria — ver server/utils/catalogo.ts
import { rotaCategoria } from '../utils/rotaCategoria'

export default rotaCategoria(null, { somenteEmPromocao: true })
