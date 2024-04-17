import { UserNovelList } from "@/[lang]/(main)/users/[user]/novels/_components/user-novel-list"
import { ParamsError } from "@/_errors/params-error"
import { useParams } from "@remix-run/react"

export default function UserNovels() {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }

  return <UserNovelList />
}
