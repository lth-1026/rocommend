import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- 모킹 ---

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  del: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { uploadAvatar } from './upload'

// --- 헬퍼 ---

function makeFormData(file: File): FormData {
  const fd = new FormData()
  fd.append('file', file)
  return fd
}

// MIME 타입별 매직 바이트 (12바이트 고정)
const MAGIC: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0],
  // RIFF(4) + size(4) + WEBP(4)
  'image/webp': [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50],
}

/** 올바른 매직 바이트가 포함된 이미지 파일을 생성한다 */
function makeImageFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(Math.max(sizeBytes, 12))
  const magic = MAGIC[type]
  if (magic) magic.forEach((b, i) => (buf[i] = b))
  return new File([buf], name, { type })
}

/** 매직 바이트 없이 빈 버퍼로 파일을 생성한다 (유효하지 않은 파일 테스트용) */
function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes)
  return new File([buf], name, { type })
}

// --- 테스트 ---

describe('uploadAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 인증 검사
  it('미인증 유저는 UNAUTHORIZED를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const fd = makeFormData(makeFile('photo.jpg', 'image/jpeg', 100))
    const result = await uploadAvatar(fd)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UNAUTHORIZED' })
  })

  // 파일 없음
  it('파일이 없으면 VALIDATION을 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const fd = new FormData()
    const result = await uploadAvatar(fd)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // 파일 타입 검증
  it('허용되지 않은 파일 타입은 VALIDATION을 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const fd = makeFormData(makeFile('doc.pdf', 'application/pdf', 100))
    const result = await uploadAvatar(fd)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // 파일 크기 검증
  it('4MB를 초과하는 파일은 VALIDATION을 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const fd = makeFormData(makeFile('big.jpg', 'image/jpeg', 4 * 1024 * 1024 + 1))
    const result = await uploadAvatar(fd)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // 정상 업로드
  it('jpeg 업로드 성공 시 DB를 업데이트하고 success를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.vercel.test/avatar.jpg' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const fd = makeFormData(makeImageFile('photo.jpg', 'image/jpeg', 1024))
    const result = await uploadAvatar(fd)

    expect(put).toHaveBeenCalledOnce()
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { image: 'https://blob.vercel.test/avatar.jpg' },
    })
    expect(result).toMatchObject({ success: true })
  })

  it('png 업로드도 성공한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.vercel.test/avatar.png' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const fd = makeFormData(makeImageFile('photo.png', 'image/png', 512))
    const result = await uploadAvatar(fd)
    expect(result).toMatchObject({ success: true })
  })

  it('webp 업로드도 성공한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.vercel.test/avatar.webp' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const fd = makeFormData(makeImageFile('photo.webp', 'image/webp', 512))
    const result = await uploadAvatar(fd)
    expect(result).toMatchObject({ success: true })
  })

  // 매직 바이트 불일치 (MIME 스푸핑)
  it('MIME 타입은 image/jpeg이지만 실제 파일이 이미지가 아니면 VALIDATION을 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const fd = makeFormData(makeFile('malicious.jpg', 'image/jpeg', 1024))
    const result = await uploadAvatar(fd)
    expect(result).toEqual({ success: false, error: expect.any(String), code: 'VALIDATION' })
  })

  // 기존 Blob 이미지 삭제
  it('기존 이미지가 Vercel Blob URL이면 del()을 호출한다', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', image: 'https://abc.public.blob.vercel-storage.com/old.jpg' },
    } as never)
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.vercel.test/new.jpg' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const fd = makeFormData(makeImageFile('photo.jpg', 'image/jpeg', 1024))
    await uploadAvatar(fd)

    expect(del).toHaveBeenCalledWith('https://abc.public.blob.vercel-storage.com/old.jpg')
  })

  it('기존 이미지가 OAuth URL이면 del()을 호출하지 않는다', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', image: 'https://lh3.googleusercontent.com/photo.jpg' },
    } as never)
    vi.mocked(put).mockResolvedValue({ url: 'https://blob.vercel.test/new.jpg' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    const fd = makeFormData(makeImageFile('photo.jpg', 'image/jpeg', 1024))
    await uploadAvatar(fd)

    expect(del).not.toHaveBeenCalled()
  })

  // Blob 오류 처리
  it('blob.put() 실패 시 UPLOAD_ERROR를 반환한다', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    vi.mocked(put).mockRejectedValue(new Error('network error'))

    const fd = makeFormData(makeImageFile('photo.jpg', 'image/jpeg', 1024))
    const result = await uploadAvatar(fd)

    expect(result).toEqual({ success: false, error: expect.any(String), code: 'UPLOAD_ERROR' })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })
})
