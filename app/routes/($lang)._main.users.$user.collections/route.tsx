import { UserNoteList } from "@/[lang]/(main)/users/[user]/notes/_components/user-note-list"
import { useParams } from "@remix-run/react"

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw new Error()
  }

  return <UserNoteList />
}
