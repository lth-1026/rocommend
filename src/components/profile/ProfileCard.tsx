import Image from 'next/image'

interface ProfileCardProps {
  name: string | null
  email: string | null
  image: string | null
}

export function ProfileCard({ name, email, image }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface px-5 py-6">
      <div className="flex size-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-border">
        {image ? (
          <Image
            src={image}
            alt="프로필 이미지"
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          <span className="text-xl font-medium text-text-secondary">
            {name?.[0] ?? '?'}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-text-primary">
          {name ?? '이름 없음'}
        </p>
        {email && (
          <p className="truncate text-sm text-text-secondary">{email}</p>
        )}
      </div>
    </div>
  )
}
