import { UserNovelList } from "@/[lang]/(main)/users/[user]/novels/_components/user-novel-list"
import { ClientParamsError } from "@/errors/client-params-error"
import { useParams } from "@remix-run/react"

export default function UserNovels() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ClientParamsError()
  }

  return <UserNovelList />
}
