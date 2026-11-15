import { useQuery } from "@apollo/client/index"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { ChevronRight, Inbox, Loader2, Settings, Store } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import {
  appFilterChipClassName,
  appPillRowClassName,
} from "~/components/app/app-pill-tab"
import {
  CoinPrice,
  RequestStatusBadge,
  RequestUserChip,
  type RequestUsers,
} from "~/components/requests/request-ui"
import { Button } from "~/components/ui/button"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import {
  type CoinRequest,
  formatRemaining,
  requestErrorMessage,
  requestsGet,
} from "~/lib/requests-api"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) =>
  createMeta(META.REQUESTS, undefined, props.params.lang)

const STATUS_TABS = [
  { value: "open", label: "進行中" },
  { value: "pending", label: "承諾待ち" },
  { value: "active", label: "制作中" },
  { value: "delivered", label: "納品済み" },
  { value: "done", label: "完了" },
  { value: "closed", label: "終了" },
] as const

/** リクエストの通知を確認済みにする（種類 REQUEST の一覧を読むとベルの数字から消える） */
const markRequestNotificationsQuery = graphql(
  `query MarkRequestNotificationsChecked {
    viewer {
      id
      notifications(offset: 0, limit: 1, where: { type: REQUEST }) {
        __typename
      }
    }
  }`,
)

type ListData = {
  requests: CoinRequest[]
  counts: Record<string, number>
  users: RequestUsers
}

/** 依頼の管理: 受けた依頼/出した依頼（下線タブ）× 状態（丸いタブ） */
export default function RequestsPage() {
  const auth = useContext(AuthContext)
  const [searchParams, setSearchParams] = useSearchParams()
  const role = searchParams.get("role") === "sent" ? "sent" : "received"
  const status = searchParams.get("status") ?? "open"
  const [data, setData] = useState<ListData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [badge, setBadge] = useState<{ received: number; toConfirm: number }>()
  useQuery(markRequestNotificationsQuery, {
    skip: !auth.isLoggedIn,
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!auth.isLoggedIn) return
    let alive = true
    setData(null)
    setError(null)
    requestsGet<ListData>({ op: "list", role, status })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(requestErrorMessage(e)))
    return () => {
      alive = false
    }
  }, [auth.isLoggedIn, role, status])

  useEffect(() => {
    if (!auth.isLoggedIn) return
    requestsGet<{ received: number; toConfirm: number }>({ op: "badge" })
      .then(setBadge)
      .catch(() => {})
  }, [auth.isLoggedIn])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    if (key === "role") next.delete("status")
    setSearchParams(next, { preventScrollReset: true })
  }

  if (auth.isNotLoggedIn) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Button asChild className="rounded-full">
          <Link to="/login">ログインして見る</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pt-3 pb-24 md:px-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-bold text-xl">リクエスト</h1>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/requests/plans">
              <Store className="mr-1 size-4" />
              プラン一覧
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to="/settings/requests">
              <Settings className="mr-1 size-4" />
              受付の設定
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b">
        {(
          [
            ["received", "受けた依頼", badge?.received ?? 0],
            ["sent", "出した依頼", badge?.toConfirm ?? 0],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            onClick={() => setParam("role", value)}
            className={cn(
              "relative py-3 font-bold text-sm",
              role === value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
            {count > 0 && (
              <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {count}
              </span>
            )}
            {role === value && (
              <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <div className={appPillRowClassName}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={appFilterChipClassName(status === tab.value)}
            onClick={() => setParam("status", tab.value)}
          >
            {tab.label}
            {data && (data.counts[tab.value] ?? 0) > 0 && (
              <span className="ml-1 opacity-70">{data.counts[tab.value]}</span>
            )}
          </button>
        ))}
      </div>

      {error ? (
        <p className="py-12 text-center text-muted-foreground">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : data.requests.length === 0 ? (
        <EmptyState role={role} />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.requests.map((r) => (
            <li key={r.id}>
              <RequestRow request={r} users={data.users} role={role} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RequestRow(props: {
  request: CoinRequest
  users: RequestUsers
  role: "received" | "sent"
}) {
  const r = props.request
  const other =
    props.users[props.role === "received" ? r.requesterUserId : r.creatorUserId]
  const deadline =
    r.status === "PENDING"
      ? { label: "返事の期限", at: r.respondBy }
      : r.status === "ACCEPTED"
        ? { label: "納期", at: r.dueAt }
        : r.status === "DELIVERED"
          ? { label: "自動で完了", at: r.autoCompleteAt }
          : null
  const needsMe =
    (props.role === "received" &&
      (r.status === "PENDING" || r.status === "ACCEPTED")) ||
    (props.role === "sent" && r.status === "DELIVERED")
  return (
    <Link
      to={`/requests/${r.id}`}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted/50 active:scale-[0.99]",
        needsMe && "border-sky-400/70",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <RequestStatusBadge status={r.status} />
          <span className="truncate text-muted-foreground text-xs">
            {r.planTitle ? `プラン「${r.planTitle}」` : "自由リクエスト"}
          </span>
        </div>
        <p className="truncate font-bold text-sm">{r.title}</p>
        <div className="flex items-center justify-between gap-2">
          <RequestUserChip user={other} link={false} />
          <CoinPrice coins={r.priceCoins} className="text-sm" />
        </div>
        {deadline?.at ? (
          <p className="text-muted-foreground text-xs">
            {deadline.label}: {formatRemaining(deadline.at)}
          </p>
        ) : null}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

function EmptyState(props: { role: "received" | "sent" }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed px-6 py-12 text-center">
      <Inbox className="size-10 text-muted-foreground" />
      {props.role === "received" ? (
        <>
          <p className="font-bold">まだ依頼はありません</p>
          <p className="text-muted-foreground text-sm">
            プランを作るとマイページとプラン一覧に並び、依頼が届くようになります。
          </p>
          <Button asChild className="rounded-full font-bold">
            <Link to="/settings/requests">プランを作る</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="font-bold">まだ依頼していません</p>
          <p className="text-muted-foreground text-sm">
            好きなクリエイターのプランからコインで依頼できます。
          </p>
          <Button asChild className="rounded-full font-bold">
            <Link to="/requests/plans">プランを探す</Link>
          </Button>
        </>
      )}
    </div>
  )
}
