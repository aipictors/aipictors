import { UserNoteList } from "@/[lang]/(main)/users/[user]/notes/_components/user-note-list"
import { ParamsError } from "@/errors/params-error"
import { useParams } from "@remix-run/react"

export default function UserNotes() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  return <UserNoteList />
}
