import type { Metadata } from "next"
import { UserNoteList } from "app/(main)/users/[user]/notes/components/UserNoteList"

const UserNotesPage = async () => {
  return (
    <>
      <UserNoteList />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default UserNotesPage
