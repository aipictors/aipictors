import { ParamsError } from "~/errors/params-error"
import { UserCollectionList } from "~/routes/($lang)._main.users.$user.collections/components/user-collection-list"
import { useParams } from "react-router"

export default function UserCollections() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  return <UserCollectionList />
}
