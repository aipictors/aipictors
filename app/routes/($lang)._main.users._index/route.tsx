import type { HeadersFunction } from "@remix-run/cloudflare"
import { Suspense } from "react"
import { config } from "~/config"
import { UserSearchList } from "~/routes/($lang)._main.users._index/components/user-search-list"
import { useTranslation } from "~/hooks/use-translation"

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UsersPage () {
  const t = useTranslation()

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">{t("ユーザ検索", "User Search")}</h1>
      <Suspense fallback={<div>{t("読み込み中...", "Loading...")}</div>}>
        <UserSearchList />
      </Suspense>
    </div>
  )
}
