'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProgressBar } from './ProgressBar'
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

type Step = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5'

interface Roastery {
  id: string
  name: string
  regions: string[]
}

interface OnboardingWizardProps {
  roasteries: Roastery[]
}

export function OnboardingWizard({ roasteries }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('Q1')
  const [q1, setQ1] = useState<BrewingMethod[]>([])
  const [q2, setQ2] = useState<PurchaseStyle | null>(null)
  const [q3, setQ3] = useState<OnboardingPriceRange[]>([])
  const [q4, setQ4] = useState<Frequency | null>(null)
  const [q5, setQ5] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isFirstTime = q4 === 'FIRST_TIME'
  const totalSteps = isFirstTime ? 4 : 5
  const currentStep = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].indexOf(step) + 1

  async function handleSubmit(answers: OnboardingAnswers) {
    setIsLoading(true)
    const result = await submitOnboarding(answers)
    if (!result.success) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }
    router.push('/home')
  }

  if (step === 'Q1') {
    return (
      <div className="space-y-6">
        <ProgressBar current={currentStep} total={totalSteps} />
        <Q1BrewingMethod
          selected={q1}
          onChange={setQ1}
          onNext={() => setStep('Q2')}
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
          onNext={() => setStep('Q5')}
          onSubmitEarly={() => {
            handleSubmit({ q1, q2: q2!, q3, q4: 'FIRST_TIME' })
          }}
          isLoading={isLoading}
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
        onSubmit={() => handleSubmit({ q1, q2: q2!, q3, q4: q4!, q5 })}
        isLoading={isLoading}
      />
    </div>
  )
}
