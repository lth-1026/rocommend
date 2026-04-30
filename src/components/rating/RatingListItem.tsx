'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ReportDialog } from './ReportDialog'
import type { RatingListItem as RatingListItemType } from '@/types/rating'

function StarRow({ score }: { score: number }) {
  return (
    <span className="text-xs text-[var(--color-accent)]">
      {'★'.repeat(score)}
      {'☆'.repeat(5 - score)}
    </span>
  )
}

function FlagIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

interface RatingListItemProps {
  item: RatingListItemType
  isLoggedIn: boolean
}

export function RatingListItem({ item, isLoggedIn }: RatingListItemProps) {
  const [reportOpen, setReportOpen] = useState(false)

  const displayName = item.user.nickname ?? '익명'
  const date = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(item.updatedAt))

  return (
    <>
      <div className="flex flex-col gap-2 py-4 border-b border-[var(--color-border)] last:border-b-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative size-7 rounded-full overflow-hidden bg-[var(--color-border)] flex-shrink-0">
              {item.user.image ? (
                <Image src={item.user.image} alt={displayName} fill className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-text-secondary)]">
                  {displayName[0]}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
                {displayName}
                {item.isOwnRating && <span className="ml-1 text-[var(--color-accent)]">(나)</span>}
              </span>
              <div className="flex items-center gap-1.5">
                <StarRow score={item.score} />
                <span className="text-xs text-[var(--color-text-disabled)]">{date}</span>
              </div>
            </div>
          </div>

          {isLoggedIn && !item.isOwnRating && (
            <button
              onClick={() => setReportOpen(true)}
              disabled={item.hasReported}
              className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                item.hasReported
                  ? 'text-[var(--color-text-disabled)] cursor-not-allowed'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'
              }`}
              title={item.hasReported ? '이미 신고한 한줄평' : '신고'}
            >
              <FlagIcon />
            </button>
          )}
        </div>

        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{item.comment}</p>
      </div>

      {isLoggedIn && !item.isOwnRating && (
        <ReportDialog open={reportOpen} onOpenChange={setReportOpen} ratingId={item.id} />
      )}
    </>
  )
}
