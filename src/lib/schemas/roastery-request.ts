import { z } from 'zod'

export const submitRoasteryRequestSchema = z.object({
  name: z.string().min(1, '로스터리 이름을 입력해 주세요').max(100, '100자 이내로 입력해 주세요'),
})
