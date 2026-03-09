import { NextResponse } from 'next/server'

// E2E 테스트 전용 세션 생성 엔드포인트
// TEST_SESSION_TOKEN 환경변수로 보호 — 프로덕션에 절대 설정 금지
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const testToken = process.env.TEST_SESSION_TOKEN
  if (!testToken || req.headers.get('x-test-token') !== testToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // TODO: NextAuth session 생성 로직 (Auth 설정 완료 후 구현)
  const { userId } = await req.json()
  return NextResponse.json({ ok: true, userId })
}
