import { Badge } from '@/components/ui/badge'
import { ROASTING_LEVEL_LABELS } from '@/types/roastery'
import type { BeanWithDetails } from '@/types/roastery'
import Image from 'next/image'

interface BeanListProps {
  beans: BeanWithDetails[]
}

export function BeanList({ beans }: BeanListProps) {
  if (beans.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 원두가 없습니다.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {beans.map((bean) => (
        <li key={bean.id} className="flex gap-4 rounded-xl border border-border p-4">
          {bean.imageUrl && (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={bean.imageUrl}
                alt={bean.name}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={bean.imageUrl.startsWith('/')}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{bean.name}</span>
              {bean.decaf && (
                <Badge variant="secondary" className="text-xs">
                  디카페인
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {ROASTING_LEVEL_LABELS[bean.roastingLevel] ?? bean.roastingLevel}
              </span>
              {bean.origins.length > 0 && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">{bean.origins.join(', ')}</span>
                </>
              )}
            </div>
            {bean.cupNotes.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {bean.cupNotes.map((note) => (
                  <Badge key={note} variant="outline" className="text-xs h-4 px-1.5">
                    {note}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
