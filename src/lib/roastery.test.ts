import { describe, expect, it } from 'vitest'
import { getRegions, getCharacteristicTags } from '../types/roastery'
import type { TagItem } from '../types/roastery'

const makeTags = (items: { name: string; category: 'REGION' | 'CHARACTERISTIC' }[]): TagItem[] =>
  items.map((t, i) => ({ id: `tag-${i}`, ...t }))

describe('getRegions', () => {
  it('REGION 카테고리 태그만 반환한다', () => {
    const tags = makeTags([
      { name: '서울', category: 'REGION' },
      { name: '부산', category: 'REGION' },
      { name: '싱글오리진', category: 'CHARACTERISTIC' },
    ])
    expect(getRegions(tags)).toEqual(['서울', '부산'])
  })

  it('CHARACTERISTIC 태그만 있으면 빈 배열을 반환한다', () => {
    const tags = makeTags([{ name: '블렌드', category: 'CHARACTERISTIC' }])
    expect(getRegions(tags)).toEqual([])
  })

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(getRegions([])).toEqual([])
  })
})

describe('getCharacteristicTags', () => {
  it('CHARACTERISTIC 카테고리 태그만 반환한다', () => {
    const tags = makeTags([
      { name: '서울', category: 'REGION' },
      { name: '싱글오리진', category: 'CHARACTERISTIC' },
      { name: '핸드드립', category: 'CHARACTERISTIC' },
    ])
    expect(getCharacteristicTags(tags)).toEqual(['싱글오리진', '핸드드립'])
  })

  it('REGION 태그만 있으면 빈 배열을 반환한다', () => {
    const tags = makeTags([{ name: '제주', category: 'REGION' }])
    expect(getCharacteristicTags(tags)).toEqual([])
  })

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(getCharacteristicTags([])).toEqual([])
  })
})
