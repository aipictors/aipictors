import { UserCollectionList } from "@/[lang]/(main)/users/[user]/collections/_components/user-collection-list"
import { useParams } from "@remix-run/react"

export default function UserNotes() {
  const params = useParams()

  if (params.user === undefined) {
    throw new Error()
  }

  return <UserCollectionList />
}
