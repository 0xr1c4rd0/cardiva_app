import { z } from 'zod'

export const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
})

export type SearchParams = z.infer<typeof searchParamsSchema>
