import { UserCollectionList } from "@/[lang]/(main)/users/[user]/collections/_components/user-collection-list"
import { ParamsError } from "@/_errors/params-error"
import { useParams } from "@remix-run/react"

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  return <UserCollectionList />
}
