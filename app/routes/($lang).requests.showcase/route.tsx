import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { ChevronLeft, Images, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import {
  RequestShowcaseBadge,
  RequestShowcaseGrid,
} from "~/components/requests/request-showcase"
import {
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { type RequestShowcaseItem, requestsGet } from "~/lib/requests-api"
import { fetchRequestsInternal } from "~/lib/server/requests-api.server"
import { createMeta } from "~/utils/create-meta"

const PAGE_SIZE = 48

type ShowcaseData = { items: RequestShowcaseItem[]; users: RequestUsers }

/**
 * 実績の一覧: ?planId= でそのプランの実績、?userId= でクリエイターの実績（透かし入りの画像だけ）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const planId = url.searchParams.get("planId") ?? ""
  const userId = url.searchParams.get("userId") ?? ""
  if (!/^\d+$/.test(planId) && !/^\d+$/.test(userId)) {
    throw new Response("Not Found", { status: 404 })
  }
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (planId) params.set("planId", planId)
  else params.set("userId", userId)
  const data = await fetchRequestsInternal<ShowcaseData>(
    context,
    `/showcase?${params.toString()}`,
  )
  return {
    planId: planId || null,
    userId: planId ? null : userId,
    items: data?.items ?? [],
    users: data?.users ?? {},
  }
}

export const meta: MetaFunction = (props) =>
  createMeta(META.REQUEST_SHOWCASE, undefined, props.params.lang)

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneMinute,
})

export default function RequestShowcasePage() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const [items, setItems] = useState(data.items)
  const [users, setUsers] = useState(data.users)
  const [hasMore, setHasMore] = useState(data.items.length >= PAGE_SIZE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setItems(data.items)
    setUsers(data.users)
    setHasMore(data.items.length >= PAGE_SIZE)
  }, [data])

  const loadMore = async () => {
    setLoading(true)
    try {
      const next = await requestsGet<ShowcaseData>({
        op: "showcase",
        planId: data.planId,
        userId: data.userId,
        limit: PAGE_SIZE,
        offset: items.length,
      })
      setItems((current) => [...current, ...next.items])
      setUsers((current) => ({ ...current, ...next.users }))
      setHasMore(next.items.length >= PAGE_SIZE)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const creator = data.userId ? users[data.userId] : undefined
  const planTitle = items[0]?.planTitle ?? null

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 pt-4 pb-24 md:px-6">
      {data.planId ? (
        <Link
          to={`/requests/plans/${data.planId}`}
          className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("プランに戻る", "Back to the plan")}
        </Link>
      ) : creator ? (
        <Link
          to={`/users/${creator.login}`}
          className="flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {t("ユーザーページに戻る", "Back to the profile")}
        </Link>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-bold text-xl">
            {data.planId && planTitle
              ? t(`プラン「${planTitle}」の実績`, `Works from "${planTitle}"`)
              : t("リクエストの実績", "Request works")}
          </h1>
          <RequestShowcaseBadge />
        </div>
        {creator && <RequestUserChip user={creator} size="md" />}
        <p className="text-muted-foreground text-xs">
          {t(
            "有料リクエストのプランで作られ、依頼者が公開を許可した作品です（透かし入り）。",
            "Works made through paid request plans and shown with the requester's permission (watermarked).",
          )}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-14 text-center">
          <Images className="size-10 text-muted-foreground" />
          <p className="font-bold">
            {t("まだ公開されている実績はありません", "No works shown yet")}
          </p>
        </div>
      ) : (
        <RequestShowcaseGrid
          items={items}
          users={users}
          showCreator={data.planId === null && creator === undefined}
        />
      )}

      {hasMore && (
        <Button
          variant="secondary"
          className="mx-auto rounded-full"
          disabled={loading}
          onClick={loadMore}
        >
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t("もっと見る", "Load more")}
        </Button>
      )}
    </div>
  )
}
