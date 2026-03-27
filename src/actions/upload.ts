'use server'

import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { join } from 'path'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types/action'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 4 * 1024 * 1024 // 4MB
const BLOB_HOST = 'blob.vercel-storage.com'
const LOCAL_UPLOADS_PATH = '/uploads/avatars'
const LOCAL_ADMIN_UPLOADS_PATH = '/uploads/admin'
const isDev = process.env.NODE_ENV === 'development'

/** 로컬 dev: public/uploads/avatars/ 에 저장, 프로덕션: Vercel Blob */
async function putFile(userId: string, file: File): Promise<string> {
  const ext = file.type.split('/')[1]
  // 업로드마다 고유 파일명 → 브라우저 캐시 자동 무효화
  const filename = `${userId}_${Date.now()}.${ext}`

  if (isDev) {
    const { writeFile, mkdir } = await import('fs/promises')
    const dir = join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(dir, filename), buffer)
    return `${LOCAL_UPLOADS_PATH}/${filename}`
  }

  const { url } = await put(`avatars/${filename}`, file, {
    access: 'public',
    addRandomSuffix: false,
  })
  return url
}

/** 로컬 dev: public/uploads/admin/ 에 저장, 프로덕션: Vercel Blob admin/ */
async function putAdminFile(folder: string, file: File): Promise<string> {
  const ext = file.type.split('/')[1]
  const filename = `${Date.now()}.${ext}`

  if (isDev) {
    const { writeFile, mkdir } = await import('fs/promises')
    const dir = join(process.cwd(), 'public', 'uploads', 'admin', folder)
    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(dir, filename), buffer)
    return `${LOCAL_ADMIN_UPLOADS_PATH}/${folder}/${filename}`
  }

  const { url } = await put(`admin/${folder}/${filename}`, file, {
    access: 'public',
    addRandomSuffix: false,
  })
  return url
}

/** 로컬 dev: 파일 삭제, 프로덕션: Vercel Blob 삭제 */
async function deleteFile(url: string): Promise<void> {
  if (isDev && url.startsWith(LOCAL_UPLOADS_PATH)) {
    const { unlink } = await import('fs/promises')
    await unlink(join(process.cwd(), 'public', url)).catch(() => {})
    return
  }
  if (url.includes(BLOB_HOST)) {
    await del(url).catch(() => {})
  }
}

function isOwnImage(url: string): boolean {
  return url.includes(BLOB_HOST) || url.startsWith(LOCAL_UPLOADS_PATH) || url.startsWith(LOCAL_ADMIN_UPLOADS_PATH)
}

export async function uploadAdminImage(
  formData: FormData,
  folder: 'roasteries' | 'beans',
): Promise<ActionResult<{ url: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }
  if (session.user.role !== 'ADMIN') {
    return { success: false, error: '관리자 권한이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { success: false, error: '파일을 선택해주세요', code: 'VALIDATION' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'jpg, png, webp 형식만 업로드할 수 있습니다', code: 'VALIDATION' }
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: '파일 크기는 4MB 이하여야 합니다', code: 'VALIDATION' }
  }

  try {
    const url = await putAdminFile(folder, file)
    return { success: true, data: { url } }
  } catch {
    return { success: false, error: '업로드 중 오류가 발생했습니다', code: 'UPLOAD_ERROR' }
  }
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: '로그인이 필요합니다', code: 'UNAUTHORIZED' }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { success: false, error: '파일을 선택해주세요', code: 'VALIDATION' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: 'jpg, png, webp 형식만 업로드할 수 있습니다', code: 'VALIDATION' }
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: '파일 크기는 4MB 이하여야 합니다', code: 'VALIDATION' }
  }

  let url: string
  try {
    url = await putFile(session.user.id, file)
  } catch {
    return { success: false, error: '업로드 중 오류가 발생했습니다', code: 'UPLOAD_ERROR' }
  }

  // 기존 이미지 삭제 (OAuth 이미지는 건드리지 않음)
  const prevImage = session.user.image
  if (prevImage && isOwnImage(prevImage)) {
    await deleteFile(prevImage)
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    })
  } catch {
    await deleteFile(url)
    return { success: false, error: '저장 중 오류가 발생했습니다', code: 'DB_ERROR' }
  }

  revalidatePath('/account')
  revalidatePath('/profile')

  return { success: true, data: { url } }
}
