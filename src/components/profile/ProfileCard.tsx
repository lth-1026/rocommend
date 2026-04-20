import Link from 'next/link'

interface ProfileCardProps {
  name: string | null
  email: string | null
  image: string | null
}

export function ProfileCard({ name, email, image }: ProfileCardProps) {
  return (
    <Link
      href="/account"
      className="flex items-center gap-4 rounded-xl bg-surface px-5 py-6 transition-colors hover:bg-bg"
    >
      <div className="flex size-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-border">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="프로필 이미지" className="size-full object-cover" />
        ) : (
          <span className="text-xl font-medium text-text-secondary">{name?.[0] ?? '?'}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-text-primary">{name ?? '이름 없음'}</p>
        {email && <p className="truncate text-sm text-text-secondary">{email}</p>}
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="flex-shrink-0 text-text-secondary"
      >
        <path
          d="M6 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  )
}
