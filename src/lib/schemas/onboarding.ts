import { z } from 'zod'
import { BREWING_METHODS, PURCHASE_STYLES, PRICE_RANGES, FREQUENCIES } from '@/types/onboarding'

export const onboardingSchema = z
  .object({
    q1: z.array(z.enum(BREWING_METHODS)).min(1, '브루잉 방법을 최소 1개 선택해주세요'),
    q2: z.enum(PURCHASE_STYLES),
    q3: z.array(z.enum(PRICE_RANGES)).min(1, '가격대를 최소 1개 선택해주세요'),
    q4: z.enum(FREQUENCIES),
    q5: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.q1.includes('NONE') && data.q1.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['q1'],
        message: '"아직 기구가 없어요"는 단독으로만 선택할 수 있습니다',
      })
    }

    if (data.q3.includes('NO_PREFERENCE') && data.q3.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['q3'],
        message: '"크게 신경 안 써요"는 단독으로만 선택할 수 있습니다',
      })
    }

    if (data.q4 !== 'FIRST_TIME' && (!data.q5 || data.q5.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['q5'],
        message: '좋아하는 로스터리를 최소 3개 선택해주세요',
      })
    }
  })
