import { NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

// E2E 테스트 전용 OAuth 우회 세션 생성 API
export async function POST(req: Request) {
  if (process.env.ENABLE_TEST_API !== '1') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const testToken = process.env.TEST_SESSION_TOKEN
  if (!testToken || req.headers.get('x-test-token') !== testToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, complete } = body as {
    name?: string
    email?: string
    complete?: boolean
  }

  const userEmail = email ?? 'test@rocommend.dev'

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: { name: name ?? '테스트 유저', email: userEmail },
  })

  if (complete) {
    await prisma.onboarding.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        version: 3,
        q1: ['ESPRESSO'],
        q2: 'ONLINE',
        q3: [],
        q4: 'MONTHLY',
        q5: [],
      },
      update: {},
    })
  }

  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24시간
  const jwt = await encode({
    secret: process.env.AUTH_SECRET!,
    token: {
      sub: user.id,
      name: user.name,
      email: user.email,
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
