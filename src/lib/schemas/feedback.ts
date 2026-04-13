import { z } from 'zod'

export const submitFeedbackSchema = z.object({
  content: z.string().min(1, '내용을 입력해 주세요').max(1000, '1000자 이내로 입력해 주세요'),
  category: z.string().max(50, '50자 이내로 입력해 주세요').optional(),
})
