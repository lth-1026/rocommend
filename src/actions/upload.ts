'use server'

import { put, del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionResult } from '@/types/action'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 4 * 1024 * 1024 // 4MB
const BLOB_HOST = 'blob.vercel-storage.com'

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
    const ext = file.type.split('/')[1]
    const { url: blobUrl } = await put(`avatars/${session.user.id}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: false,
    })
    url = blobUrl
  } catch {
    return { success: false, error: '업로드 중 오류가 발생했습니다', code: 'UPLOAD_ERROR' }
  }

  // 기존 Vercel Blob 이미지만 삭제 (OAuth 이미지는 건드리지 않음)
  const prevImage = session.user.image
  if (prevImage && prevImage.includes(BLOB_HOST)) {
    await del(prevImage).catch(() => {})
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: url },
  })

  revalidatePath('/account')
  revalidatePath('/profile')

  return { success: true, data: { url } }
}
