'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { uploadAdminImage } from '@/actions/upload'

interface ImageUploadProps {
  folder: 'roasteries' | 'beans'
  value: string
  onChange: (url: string) => void
  onError: (msg: string) => void
}

export function ImageUpload({ folder, value, onChange, onError }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 로컬 미리보기
    setPreview(URL.createObjectURL(file))

    setIsUploading(true)
    onError('')

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadAdminImage(formData, folder)
    setIsUploading(false)

    if (!result.success) {
      setPreview(null)
      onError(result.error)
      return
    }

    onChange(result.data!.url)
  }

  const displaySrc = preview ?? value

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text">이미지</label>
      <div className="flex items-center gap-4">
        {/* 미리보기 */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-sub">
          {displaySrc ? (
            <Image src={displaySrc} alt="미리보기" fill className="object-cover" unoptimized={displaySrc.startsWith('blob:')} />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-text-sub">없음</span>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
              업로드 중…
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text hover:bg-surface-sub transition-colors disabled:opacity-50"
          >
            {value ? '이미지 변경' : '이미지 선택'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setPreview(null) }}
              className="text-xs text-text-sub hover:text-error transition-colors"
            >
              삭제
            </button>
          )}
          <p className="text-xs text-text-sub">jpg, png, webp / 최대 4MB</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
