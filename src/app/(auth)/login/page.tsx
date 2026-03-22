import { LoginButton } from '@/components/auth/LoginButton'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-8">
      {/* 로고 + 슬로건 */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Rocommend</h1>
        <p className="text-sm text-text-secondary">취향에 맞는 스페셜티 커피 로스터리를 찾아보세요</p>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <LoginButton provider="google" />
        <LoginButton provider="kakao" />
        <LoginButton provider="naver" />
      </div>
    </div>
  )
}
