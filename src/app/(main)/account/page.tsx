import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NameEditForm } from '@/components/account/NameEditForm'
import { AvatarUpload } from '@/components/account/AvatarUpload'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true },
  })

  return (
    <div className="page-wrapper py-8 flex flex-col gap-8">
      <h1 className="text-xl font-semibold">계정 관리</h1>

      <section className="flex flex-col gap-4 rounded-xl bg-surface px-5 py-6">
        <h2 className="text-sm font-semibold text-text-primary">프로필 정보</h2>
        <AvatarUpload currentImage={user?.image ?? null} name={user?.name ?? null} />
        <NameEditForm currentName={user?.name ?? null} />
      </section>

      <section className="flex flex-col gap-4 rounded-xl bg-surface px-5 py-6">
        <h2 className="text-sm font-semibold text-text-primary">계정</h2>
        <DeleteAccountDialog />
      </section>
    </div>
  )
}
