import { UserNoteList } from "@/[lang]/(main)/users/[user]/notes/_components/user-note-list"
import { ClientParamsError } from "@/errors/client-params-error"
import { useParams } from "@remix-run/react"

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ClientParamsError()
  }

  return <UserNoteList />
}
