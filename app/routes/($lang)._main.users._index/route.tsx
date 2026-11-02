import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Suspense } from "react"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { UserSearchList } from "~/routes/($lang)._main.users._index/components/user-search-list"
import { useTranslation } from "~/hooks/use-translation"

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.USER_SEARCH, undefined, props.params.lang)
}

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
