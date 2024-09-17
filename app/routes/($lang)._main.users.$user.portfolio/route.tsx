import { ParamsError } from "~/errors/params-error"
import { UserNovelList } from "~/routes/($lang)._main.users.$user.novels/components/user-novel-list"
import { useParams } from "@remix-run/react"

export default function UserPortfolio() {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }

  return <UserNovelList works={[]} />
}
