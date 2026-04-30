import { redirect } from 'next/navigation'

export default function BookmarksPage() {
  redirect('/activity?tab=bookmarks')
}
