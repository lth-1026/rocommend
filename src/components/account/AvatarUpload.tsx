'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { uploadAvatar } from '@/actions/upload'

interface AvatarUploadProps {
  currentImage: string | null
  name: string | null
}

export function AvatarUpload({ currentImage, name }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const initials = name?.charAt(0)?.toUpperCase() ?? '?'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setPreview(URL.createObjectURL(file))

    const fd = new FormData()
    fd.append('file', file)

    startTransition(async () => {
      const result = await uploadAvatar(fd)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error)
        setPreview(currentImage)
      }
      // input 초기화 (같은 파일 재업로드 허용)
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="프로필 사진 변경"
        className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-alt shrink-0 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        {preview ? (
          <Image src={preview} alt="프로필 사진" fill className="object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-xl font-semibold text-text-secondary">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white text-xs">
          {isPending ? '업로드 중...' : '변경'}
        </span>
      </button>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-60 text-left"
        >
          {isPending ? '업로드 중...' : '사진 변경'}
        </button>
        <p className="text-xs text-text-secondary">jpg, png, webp · 최대 4MB</p>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
