import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('클래스를 합친다', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('falsy 값을 제거한다', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('Tailwind 충돌 클래스를 병합한다', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
