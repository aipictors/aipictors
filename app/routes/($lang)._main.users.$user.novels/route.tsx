import { ParamsError } from "~/errors/params-error"
import { UserNovelList } from "~/routes/($lang)._main.users.$user.novels/components/user-novel-list"
import { useParams } from "react-router"

export default function UserNovels() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  return <UserNovelList works={[]} />
}
