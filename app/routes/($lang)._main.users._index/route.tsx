import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { Suspense } from "react"
import { config, META } from "~/config"
import { UserSearchList } from "~/routes/($lang)._main.users._index/components/user-search-list"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.USERS_SEARCH, undefined, props.params.lang)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function UsersPage () {
  const t = useTranslation()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 py-4">
      <h1 className="font-bold text-2xl">{t("ユーザー検索", "User Search")}</h1>
      <Suspense
        fallback={
          <div className="min-h-[60vh] text-muted-foreground text-sm">
            {t("読み込み中...", "Loading...")}
          </div>
        }
      >
        <UserSearchList />
      </Suspense>
    </div>
  )
}
