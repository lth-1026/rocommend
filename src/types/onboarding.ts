export const BREWING_METHODS = [
  'ESPRESSO',
  'POUR_OVER',
  'FRENCH_PRESS',
  'COLD_BREW',
  'AEROPRESS',
  'MOKA_POT',
  'NONE',
] as const

export const PURCHASE_STYLES = ['ONLINE', 'OFFLINE', 'BOTH'] as const

export const PRICE_RANGES = ['LOW', 'MID', 'HIGH', 'NO_PREFERENCE'] as const

export const FREQUENCIES = [
  'FIRST_TIME',
  'QUARTERLY_OR_LESS',
  'MONTHLY',
  'BIMONTHLY',
  'WEEKLY_OR_MORE',
] as const

export type BrewingMethod = (typeof BREWING_METHODS)[number]
export type PurchaseStyle = (typeof PURCHASE_STYLES)[number]
export type OnboardingPriceRange = (typeof PRICE_RANGES)[number]
export type Frequency = (typeof FREQUENCIES)[number]

export interface OnboardingAnswers {
  q1: BrewingMethod[]
  q2: PurchaseStyle
  q3: OnboardingPriceRange[]
  q4: Frequency
  q5?: string[] // roasteryId[], q4 = FIRST_TIME이면 undefined
}

export const BREWING_METHOD_LABELS: Record<BrewingMethod, string> = {
  ESPRESSO: '에스프레소 머신',
  POUR_OVER: '핸드드립',
  FRENCH_PRESS: '프렌치 프레스',
  COLD_BREW: '콜드브루',
  AEROPRESS: '에어로프레스',
  MOKA_POT: '모카포트',
  NONE: '아직 기구가 없어요',
}

export const PURCHASE_STYLE_LABELS: Record<PurchaseStyle, string> = {
  ONLINE: '주로 온라인',
  OFFLINE: '주로 오프라인',
  BOTH: '온/오프라인 모두',
}

export const PRICE_RANGE_LABELS: Record<OnboardingPriceRange, string> = {
  LOW: '2만원 미만',
  MID: '2~3.5만원',
  HIGH: '3.5만원 이상',
  NO_PREFERENCE: '크게 신경 안 써요',
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  FIRST_TIME: '처음 구매해보려고요',
  QUARTERLY_OR_LESS: '분기에 한 번 이하',
  MONTHLY: '한 달에 한 번',
  BIMONTHLY: '한 달에 두 번',
  WEEKLY_OR_MORE: '매주 이상',
}
