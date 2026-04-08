const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  kakao: '카카오',
  naver: '네이버',
}

const errorMessages: Record<string, string> = {
  OAuthCallbackError: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
  OAuthSignInError: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
  default: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
}

export function ErrorAlert({ error, provider }: { error: string; provider?: string }) {
  let message: string

  if (error === 'OAuthAccountNotLinked') {
    const label = provider ? (PROVIDER_LABELS[provider] ?? provider) : null
    message = label
      ? `이미 ${label}로 가입된 계정입니다. ${label} 로그인을 사용해주세요.`
      : '이미 가입된 계정입니다. 처음 가입할 때 사용한 로그인 방법으로 시도해주세요.'
  } else {
    message = errorMessages[error] ?? errorMessages.default
  }

  return (
    <div
      role="alert"
      className="rounded-btn border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      {message}
    </div>
  )
}
