import { UserNoteList } from "app/[lang]/(main)/users/[user]/notes/_components/UserNoteList"
import type { Metadata } from "next"

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
