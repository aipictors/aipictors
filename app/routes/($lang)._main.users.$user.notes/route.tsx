import { ParamsError } from "~/errors/params-error"
import { UserNoteList } from "~/routes/($lang)._main.users.$user.notes/components/user-note-list"
import { useParams } from "@remix-run/react"

export default function UserNotes() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  return <UserNoteList />
}
