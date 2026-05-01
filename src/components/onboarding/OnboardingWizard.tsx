'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { ProgressBar } from './ProgressBar'
import { Q0Nickname } from './steps/Q0Nickname'
import { Q1BrewingMethod } from './steps/Q1BrewingMethod'
import { Q2PurchaseStyle } from './steps/Q2PurchaseStyle'
import { Q3PriceRange } from './steps/Q3PriceRange'
import { Q4Frequency } from './steps/Q4Frequency'
import { Q5Roasteries } from './steps/Q5Roasteries'
import { submitOnboarding } from '@/actions/onboarding'
import type {
  BrewingMethod,
  PurchaseStyle,
  OnboardingPriceRange,
  Frequency,
  OnboardingAnswers,
} from '@/types/onboarding'

// 실제 표시 순서: Q0 → Q4(구매빈도, FIRST_TIME이면 즉시 종료) → Q1 → Q2 → Q3 → Q5
type Step = 'Q0' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'
const STEP_ORDER: Step[] = ['Q0', 'Q4', 'Q1', 'Q2', 'Q3', 'Q5']

interface Roastery {
  id: string
  name: string
  tags: { id: string; name: string; category: string; isPrimary: boolean }[]
}

interface OnboardingWizardProps {
  initialNickname: string
  currentImage: string | null
  name: string | null
  roasteries: Roastery[]
}

export function OnboardingWizard({
  initialNickname,
  currentImage,
  name,
  roasteries,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>('Q0')
  const [q1, setQ1] = useState<BrewingMethod[]>([])
  const [q2, setQ2] = useState<PurchaseStyle | null>(null)
  const [q3, setQ3] = useState<OnboardingPriceRange[]>([])
  const [q4, setQ4] = useState<Frequency | null>(null)
  const [q5, setQ5] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isFirstTime = q4 === 'FIRST_TIME'
  const totalSteps = isFirstTime ? 2 : 6
  const currentStep = STEP_ORDER.indexOf(step) + 1

  async function handleSubmit(answers: OnboardingAnswers) {
    setIsLoading(true)
    const result = await submitOnboarding(answers)
    if (result && !result.success) {
      toast.error(result.error)
      if (result.code === 'UNAUTHORIZED') {
        await signOut({ callbackUrl: '/login' })
        return
      }
      setIsLoading(false)
    }
  }

  if (step === 'Q0') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q0Nickname
          initialNickname={initialNickname}
          currentImage={currentImage}
          name={name}
          onNext={() => setStep('Q4')}
        />
      </div>
    )
  }

  if (step === 'Q4') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q4Frequency
          selected={q4}
          onChange={setQ4}
          onNext={() => setStep('Q1')}
          onSubmitEarly={() => handleSubmit({ q1: [], q3: [], q4: 'FIRST_TIME' })}
          onBack={() => setStep('Q0')}
          isLoading={isLoading}
        />
      </div>
    )
  }

  if (step === 'Q1') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q1BrewingMethod
          selected={q1}
          onChange={setQ1}
          onNext={() => setStep('Q2')}
          onBack={() => setStep('Q4')}
        />
      </div>
    )
  }

  if (step === 'Q2') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q2PurchaseStyle
          selected={q2}
          onChange={setQ2}
          onNext={() => setStep('Q3')}
          onBack={() => setStep('Q1')}
        />
      </div>
    )
  }

  if (step === 'Q3') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q3PriceRange
          selected={q3}
          onChange={setQ3}
          onNext={() => setStep('Q5')}
          onBack={() => setStep('Q2')}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProgressBar current={currentStep} total={totalSteps} />
      <Q5Roasteries
        roasteries={roasteries}
        selected={q5}
        onChange={setQ5}
        onSubmit={() => handleSubmit({ q1, q2: q2 ?? undefined, q3, q4: q4!, q5 })}
        onBack={() => setStep('Q3')}
        isLoading={isLoading}
      />
    </div>
  )
}
