interface RatingDisplayProps {
  avgRating: number | null
  ratingCount: number
  size?: 'default' | 'lg'
}

export function RatingDisplay({ avgRating, ratingCount, size = 'default' }: RatingDisplayProps) {
  if (ratingCount === 0) {
    return (
      <span className={size === 'lg' ? 'text-sm text-muted-foreground' : 'text-muted-foreground'}>
        아직 평가 없음
      </span>
    )
  }

  return (
    <>
      <span className={`text-accent font-medium ${size === 'lg' ? 'text-lg' : ''}`}>
        ★ {avgRating?.toFixed(1)}
      </span>
      <span className={size === 'lg' ? 'text-xs text-muted-foreground' : 'text-muted-foreground'}>
        ({ratingCount}
        {size === 'lg' ? '개 평가' : ''})
      </span>
    </>
  )
}
