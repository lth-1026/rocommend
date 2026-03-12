import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getBookmarks } from '@/lib/queries/bookmark'
import { BookmarkList } from '@/components/bookmark/BookmarkList'
import { EmptyBookmark } from '@/components/bookmark/EmptyBookmark'

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const bookmarks = await getBookmarks(session.user.id)

  return (
    <div className="page-wrapper py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">즐겨찾기</h1>

      {bookmarks.length === 0 ? (
        <EmptyBookmark />
      ) : (
        <BookmarkList bookmarks={bookmarks} initialSort="name" />
      )}
    </div>
  )
}
