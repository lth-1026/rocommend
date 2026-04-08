import { describe, it, expect, vi } from 'vitest'

vi.mock('next-auth/providers/google', () => ({ default: vi.fn(() => ({})) }))
vi.mock('next-auth/providers/kakao', () => ({ default: vi.fn(() => ({})) }))
vi.mock('next-auth/providers/naver', () => ({ default: vi.fn(() => ({})) }))

const { authConfig } = await import('@/lib/auth.config')
const authorized = authConfig.callbacks!.authorized! as (params: {
  auth: unknown
  request: { nextUrl: URL }
}) => unknown

function url(path: string) {
  return new URL(`http://localhost:3000${path}`)
}

function completeUser(opts: { admin?: boolean } = {}) {
  return {
    user: {
      id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role: opts.admin ? 'ADMIN' : 'USER',
      onboardingVersion: 3,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

function incompleteUser() {
  return {
    user: {
      id: 'u1',
      name: 'Test',
      email: 'test@test.com',
      role: 'USER',
      onboardingVersion: null,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
}

describe('authorized callback', () => {
  // U-42: 비로그인 + 보호 경로 → /login 리디렉트
  it('U-42: 비로그인 유저가 보호 경로 접근 시 /login으로 리디렉트된다', async () => {
    const result = await authorized({ auth: null, request: { nextUrl: url('/profile') } })
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    expect(response.headers.get('location')).toContain('/login')
  })

  // U-43: 비로그인 + 공개 경로 → 통과
  it('U-43: 비로그인 유저가 공개 경로 접근 시 통과된다', async () => {
    const result = await authorized({ auth: null, request: { nextUrl: url('/roasteries') } })
    expect(result).toBe(true)
  })

  // U-43b: 비로그인 + /login → 통과
  it('U-43b: 비로그인 유저가 /login 접근 시 통과된다', async () => {
    const result = await authorized({ auth: null, request: { nextUrl: url('/login') } })
    expect(result).toBe(true)
  })

  // U-44: AUTH-INCOMPLETE + /home → /onboarding 리디렉트
  it('U-44: AUTH-INCOMPLETE 유저가 /home 접근 시 /onboarding으로 리디렉트된다', async () => {
    const result = await authorized({ auth: incompleteUser(), request: { nextUrl: url('/home') } })
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    expect(response.headers.get('location')).toContain('/onboarding')
  })

  // U-45: AUTH-INCOMPLETE + /onboarding → 통과
  it('U-45: AUTH-INCOMPLETE 유저가 /onboarding 접근 시 통과된다', async () => {
    const result = await authorized({
      auth: incompleteUser(),
      request: { nextUrl: url('/onboarding') },
    })
    expect(result).toBe(true)
  })

  // U-46: AUTH-COMPLETE + /home → 통과
  it('U-46: AUTH-COMPLETE 유저가 /home 접근 시 통과된다', async () => {
    const result = await authorized({ auth: completeUser(), request: { nextUrl: url('/home') } })
    expect(result).toBe(true)
  })

  // U-47: AUTH-COMPLETE + /login → /home 리디렉트
  it('U-47: AUTH-COMPLETE 유저가 /login 접근 시 /home으로 리디렉트된다', async () => {
    const result = await authorized({ auth: completeUser(), request: { nextUrl: url('/login') } })
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    expect(response.headers.get('location')).toContain('/home')
  })

  // U-48: ADMIN + /admin → 통과
  it('U-48: ADMIN 유저가 /admin 접근 시 통과된다', async () => {
    const result = await authorized({
      auth: completeUser({ admin: true }),
      request: { nextUrl: url('/admin') },
    })
    expect(result).toBe(true)
  })

  // U-49: 비어드민 + /admin → /home 리디렉트
  it('U-49: 일반 유저가 /admin 접근 시 /home으로 리디렉트된다', async () => {
    const result = await authorized({ auth: completeUser(), request: { nextUrl: url('/admin') } })
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    expect(response.headers.get('location')).toContain('/home')
  })

  // 비로그인 + /admin → /login 리디렉트
  it('비로그인 유저가 /admin 접근 시 /login으로 리디렉트된다', async () => {
    const result = await authorized({ auth: null, request: { nextUrl: url('/admin') } })
    expect(result).toBeInstanceOf(Response)
    const response = result as Response
    expect(response.headers.get('location')).toContain('/login')
  })
})
