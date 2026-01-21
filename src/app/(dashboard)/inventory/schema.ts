import { z } from 'zod'

export const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().max(200).default(''),
  sortBy: z
    .enum(['nome', 'codigo', 'preco', 'stock', 'categoria'])
    .default('nome'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  category: z.string().optional(),
})

export type SearchParams = z.infer<typeof searchParamsSchema>
