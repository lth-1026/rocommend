import { z } from 'zod'

export const upsertRatingSchema = z.object({
  roasteryId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(100).optional(),
})

export const deleteRatingSchema = z.object({
  roasteryId: z.string().min(1),
})

export const reportRatingSchema = z.object({
  ratingId: z.string().min(1),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'OTHER']),
})

export type UpsertRatingInput = z.infer<typeof upsertRatingSchema>
export type DeleteRatingInput = z.infer<typeof deleteRatingSchema>
export type ReportRatingInput = z.infer<typeof reportRatingSchema>
