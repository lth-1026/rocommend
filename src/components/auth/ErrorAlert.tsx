const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: '해당 이메일로는 다른 로그인 방법을 사용해주세요',
  OAuthCallbackError: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
  OAuthSignInError: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
  default: '로그인 중 문제가 발생했습니다. 다시 시도해주세요',
}

export function ErrorAlert({ error }: { error: string }) {
  const message = errorMessages[error] ?? errorMessages.default

  return (
    <div
      role="alert"
      className="rounded-btn border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      {message}
    </div>
  )
}
