export interface Artigo {
  id: number
  codigo: string
  nome: string
  descricao: string | null
  preco: number | null
  stock: number | null
  categoria: string | null
  created_at: string
  updated_at: string
}
