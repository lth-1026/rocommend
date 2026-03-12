import { z } from 'zod'

export const bookmarkSchema = z.object({
  roasteryId: z.string().min(1),
})
