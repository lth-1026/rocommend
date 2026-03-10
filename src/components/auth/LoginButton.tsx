import Image from 'next/image'
import { signIn } from '@/lib/auth'

type Provider = 'google' | 'kakao' | 'naver'

const providerConfig: Record<
  Provider,
  { label: string; icon: string; bg: string; text: string; border?: string }
> = {
  google: {
    label: 'Google로 계속하기',
    icon: '/icons/google.svg',
    bg: 'bg-white hover:bg-gray-50',
    text: 'text-[#3c4043]',
    border: 'border border-[#dadce0]',
  },
  kakao: {
    label: '카카오로 계속하기',
    icon: '/icons/kakao.svg',
    bg: 'bg-[#FEE500] hover:bg-[#F5DC00]',
    text: 'text-[#3C1E1E]',
  },
  naver: {
    label: '네이버로 계속하기',
    icon: '/icons/naver.svg',
    bg: 'bg-[#03C75A] hover:bg-[#02B350]',
    text: 'text-white',
  },
}

export function LoginButton({ provider }: { provider: Provider }) {
  const config = providerConfig[provider]

  return (
    <form
      action={async () => {
        'use server'
        await signIn(provider, { redirectTo: '/home' })
      }}
    >
      <button
        type="submit"
        className={`flex w-full items-center justify-center gap-3 rounded-btn px-4 py-3 text-sm font-medium transition-colors ${config.bg} ${config.text} ${config.border ?? ''}`}
      >
        <Image src={config.icon} alt={`${provider} 로고`} width={20} height={20} />
        {config.label}
      </button>
    </form>
  )
}
