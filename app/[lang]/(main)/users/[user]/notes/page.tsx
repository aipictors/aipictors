import { UserNoteList } from "@/[lang]/(main)/users/[user]/notes/_components/user-note-list"
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

export default UserNotesPage
