import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// E2E 테스트 전용 OAuth 우회 세션 생성 API
// NODE_ENV=test + TEST_SESSION_TOKEN 헤더 일치 시에만 활성화
export async function POST(req: Request) {
  if (process.env.ENABLE_TEST_API !== '1') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const testToken = process.env.TEST_SESSION_TOKEN
  if (!testToken || req.headers.get('x-test-token') !== testToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, onboardingVersion } = body as {
    name?: string
    email?: string
    onboardingVersion?: number | null
  }

  const userEmail = email ?? 'test@rocommend.dev'

  // 테스트 유저 생성 또는 재사용
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      preferences:
        onboardingVersion !== undefined
          ? onboardingVersion !== null
            ? { onboardingVersion }
            : Prisma.DbNull
          : undefined,
    },
    create: {
      name: name ?? '테스트 유저',
      email: userEmail,
      preferences:
        onboardingVersion != null ? { onboardingVersion } : undefined,
    },
  })

  // JWT strategy: encode()로 서명된 JWT 발급
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24시간
  const jwt = await encode({
    secret: process.env.AUTH_SECRET!,
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
      onboardingVersion: onboardingVersion ?? null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires.getTime() / 1000),
    },
    salt: 'authjs.session-token',
  })

  const response = NextResponse.json({ ok: true, userId: user.id })
  response.cookies.set('authjs.session-token', jwt, {
    httpOnly: true,
    path: '/',
    expires,
    sameSite: 'lax',
  })

  return response
}
