'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { ActionResult } from '@/types/action'
import type { PriceRange } from '@prisma/client'
import { flattenTags } from '@/types/roastery'

// ── 권한 체크 헬퍼 ─────────────────────────────────────
type AdminCheckError = { error: string; code: 'UNAUTHORIZED' }
type AdminCheckOk = { userId: string }
type AdminCheck = AdminCheckError | AdminCheckOk

async function requireAdmin(): Promise<AdminCheck> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }
  if (session.user.role !== 'ADMIN') {
    return { error: '관리자 권한이 필요합니다', code: 'UNAUTHORIZED' }
  }
  return { userId: session.user.id }
}

// ── 로스터리 생성 ───────────────────────────────────────
export interface ChannelInput {
  channelKey: string
  url: string
}

export interface CreateRoasteryInput {
  name: string
  description: string
  address: string
  regions: string[]
  tags: string[] // CHARACTERISTIC 태그
  priceRange: PriceRange
  decaf: boolean
  imageUrl: string
  channels: ChannelInput[]
  isOnboardingCandidate: boolean
}

/** 지역 + 특성 태그를 upsert하고 ID + isPrimary 배열을 반환 */
async function upsertTags(
  regions: string[],
  characteristicTags: string[]
): Promise<{ id: string; isPrimary: boolean }[]> {
  const tagData = [
    ...regions.map((name, i) => ({
      name: name.trim(),
      category: 'REGION' as const,
      isPrimary: i === 0,
    })),
    ...characteristicTags.map((name) => ({
      name: name.trim(),
      category: 'CHARACTERISTIC' as const,
      isPrimary: false,
    })),
  ].filter((t) => t.name)

  if (tagData.length === 0) return []

  const tags = await Promise.all(
    tagData.map(async ({ isPrimary, ...tagFields }) => {
      const tag = await prisma.tag.upsert({
        where: { name_category: { name: tagFields.name, category: tagFields.category } },
        create: tagFields,
        update: {},
        select: { id: true },
      })
      return { id: tag.id, isPrimary }
    })
  )
  return tags
}

export async function createRoastery(
  input: CreateRoasteryInput
): Promise<ActionResult<{ id: string }>> {
  const check = await requireAdmin()
  if ('error' in check) {
    return { success: false, error: check.error, code: check.code }
  }

  if (!input.name.trim()) {
    return { success: false, error: '로스터리 이름은 필수입니다', code: 'VALIDATION' }
  }
  if (input.regions.length === 0) {
    return { success: false, error: '지역을 1개 이상 입력해주세요', code: 'VALIDATION' }
  }
  if (!['LOW', 'MID', 'HIGH'].includes(input.priceRange)) {
    return { success: false, error: '가격대가 올바르지 않습니다', code: 'VALIDATION' }
  }

  try {
    const tagIds = await upsertTags(input.regions, input.tags)

    const roastery = await prisma.roastery.create({
      data: {
        name: input.name.trim(),
        description: input.description.trim() || null,
        address: input.address.trim() || null,
        priceRange: input.priceRange,
        decaf: input.decaf,
        imageUrl: input.imageUrl.trim() || null,
        isOnboardingCandidate: input.isOnboardingCandidate,
        tags: { create: tagIds.map(({ id: tagId, isPrimary }) => ({ tagId, isPrimary })) },
        channels: {
          create: input.channels
            .filter((c) => c.channelKey && c.url.trim())
            .map((c) => ({ channelKey: c.channelKey, url: c.url.trim() })),
        },
      },
      select: { id: true },
    })
    return { success: true, data: { id: roastery.id } }
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }
}

// ── 원두 생성 ───────────────────────────────────────────
export interface CreateBeanInput {
  roasteryId: string
  name: string
  origins: string[]
  roastingLevel: string
  decaf: boolean
  cupNotes: string[]
  imageUrl: string
}

const ROASTING_LEVELS = ['LIGHT', 'MEDIUM', 'MEDIUM_DARK', 'DARK']

export async function createBean(input: CreateBeanInput): Promise<ActionResult<{ id: string }>> {
  const check = await requireAdmin()
  if ('error' in check) {
    return { success: false, error: check.error, code: check.code }
  }

  if (!input.roasteryId) {
    return { success: false, error: '로스터리를 선택해주세요', code: 'VALIDATION' }
  }
  if (!input.name.trim()) {
    return { success: false, error: '원두 이름은 필수입니다', code: 'VALIDATION' }
  }
  if (!ROASTING_LEVELS.includes(input.roastingLevel)) {
    return { success: false, error: '로스팅 레벨이 올바르지 않습니다', code: 'VALIDATION' }
  }

  try {
    const bean = await prisma.bean.create({
      data: {
        roasteryId: input.roasteryId,
        name: input.name.trim(),
        origins: input.origins.map((o) => o.trim()).filter(Boolean),
        roastingLevel: input.roastingLevel,
        decaf: input.decaf,
        cupNotes: input.cupNotes.map((n) => n.trim()).filter(Boolean),
        imageUrl: input.imageUrl.trim() || null,
      },
      select: { id: true },
    })
    return { success: true, data: { id: bean.id } }
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }
}

// ── 로스터리 수정 ───────────────────────────────────────
export async function updateRoastery(
  id: string,
  input: CreateRoasteryInput
): Promise<ActionResult<{ id: string }>> {
  const check = await requireAdmin()
  if ('error' in check) {
    return { success: false, error: check.error, code: check.code }
  }

  if (!input.name.trim()) {
    return { success: false, error: '로스터리 이름은 필수입니다', code: 'VALIDATION' }
  }
  if (input.regions.length === 0) {
    return { success: false, error: '지역을 1개 이상 입력해주세요', code: 'VALIDATION' }
  }
  if (!['LOW', 'MID', 'HIGH'].includes(input.priceRange)) {
    return { success: false, error: '가격대가 올바르지 않습니다', code: 'VALIDATION' }
  }

  try {
    const tagIds = await upsertTags(input.regions, input.tags)

    const roastery = await prisma.roastery.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: input.description.trim() || null,
        address: input.address.trim() || null,
        priceRange: input.priceRange,
        decaf: input.decaf,
        imageUrl: input.imageUrl.trim() || null,
        isOnboardingCandidate: input.isOnboardingCandidate,
        tags: {
          deleteMany: {},
          create: tagIds.map(({ id: tagId, isPrimary }) => ({ tagId, isPrimary })),
        },
        channels: {
          deleteMany: {},
          create: input.channels
            .filter((c) => c.channelKey && c.url.trim())
            .map((c) => ({ channelKey: c.channelKey, url: c.url.trim() })),
        },
      },
      select: { id: true },
    })
    return { success: true, data: { id: roastery.id } }
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }
}

// ── 원두 수정 ───────────────────────────────────────────
export async function updateBean(
  id: string,
  input: CreateBeanInput
): Promise<ActionResult<{ id: string }>> {
  const check = await requireAdmin()
  if ('error' in check) {
    return { success: false, error: check.error, code: check.code }
  }

  if (!input.roasteryId) {
    return { success: false, error: '로스터리를 선택해주세요', code: 'VALIDATION' }
  }
  if (!input.name.trim()) {
    return { success: false, error: '원두 이름은 필수입니다', code: 'VALIDATION' }
  }
  if (!ROASTING_LEVELS.includes(input.roastingLevel)) {
    return { success: false, error: '로스팅 레벨이 올바르지 않습니다', code: 'VALIDATION' }
  }

  try {
    const bean = await prisma.bean.update({
      where: { id },
      data: {
        roasteryId: input.roasteryId,
        name: input.name.trim(),
        origins: input.origins.map((o) => o.trim()).filter(Boolean),
        roastingLevel: input.roastingLevel,
        decaf: input.decaf,
        cupNotes: input.cupNotes.map((n) => n.trim()).filter(Boolean),
        imageUrl: input.imageUrl.trim() || null,
      },
      select: { id: true },
    })
    return { success: true, data: { id: bean.id } }
  } catch {
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }
}

// ── 로스터리 단건 조회 (admin 전용) ─────────────────────
export async function getAdminRoastery(id: string) {
  const check = await requireAdmin()
  if ('error' in check) redirect('/home')

  const raw = await prisma.roastery.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      tags: {
        select: { isPrimary: true, tag: { select: { id: true, name: true, category: true } } },
      },
      priceRange: true,
      decaf: true,
      imageUrl: true,
      isOnboardingCandidate: true,
      channels: {
        select: { id: true, channelKey: true, url: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!raw) return null
  return { ...raw, tags: flattenTags(raw.tags) }
}

// ── 원두 단건 조회 (admin 전용) ──────────────────────────
export async function getAdminBean(id: string) {
  const check = await requireAdmin()
  if ('error' in check) redirect('/home')

  return prisma.bean.findUnique({
    where: { id },
    select: {
      id: true,
      roasteryId: true,
      name: true,
      origins: true,
      roastingLevel: true,
      decaf: true,
      cupNotes: true,
      imageUrl: true,
    },
  })
}

// ── 로스터리 목록 (admin 전용) ──────────────────────────
export async function getAdminRoasteries() {
  const check = await requireAdmin()
  if ('error' in check) redirect('/home')

  const rows = await prisma.roastery.findMany({
    select: {
      id: true,
      name: true,
      tags: {
        select: { isPrimary: true, tag: { select: { id: true, name: true, category: true } } },
      },
      priceRange: true,
      decaf: true,
      isOnboardingCandidate: true,
      createdAt: true,
      _count: { select: { beans: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({ ...r, tags: flattenTags(r.tags) }))
}

// ── 원두 목록 (admin 전용) ──────────────────────────────
export async function getAdminBeans() {
  const check = await requireAdmin()
  if ('error' in check) redirect('/home')

  return prisma.bean.findMany({
    select: {
      id: true,
      name: true,
      roastingLevel: true,
      decaf: true,
      origins: true,
      createdAt: true,
      roastery: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ── 특정 로스터리의 원두 목록 (admin 전용) ───────────────
export async function getAdminRoasteryBeans(roasteryId: string) {
  const check = await requireAdmin()
  if ('error' in check) redirect('/home')

  return prisma.bean.findMany({
    where: { roasteryId },
    select: {
      id: true,
      name: true,
      roastingLevel: true,
      decaf: true,
      origins: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}
