import { ParamsError } from "@/_errors/params-error"
import { UserNoteList } from "@/routes/($lang)._main.users.$user.notes/_components/user-note-list"
import { useParams } from "@remix-run/react"

export default function UserNotes() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  return <UserNoteList />
}
