import { ParamsError } from "@/_errors/params-error"
import { UserCollectionList } from "@/routes/($lang)._main.users.$user.collections/_components/user-collection-list"
import { useParams } from "@remix-run/react"

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  return <UserCollectionList />
}
