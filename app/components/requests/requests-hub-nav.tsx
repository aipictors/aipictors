import { useLocation, useOutletContext } from "@remix-run/react"
import { Inbox, type LucideIcon, Plus, Search, Store } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { requestsGet } from "~/lib/requests-api"
import { cn } from "~/lib/utils"

export type RequestsHubTab = "find" | "manage" | "mine"

/** 対応が必要な依頼の数（受けた依頼の返事・納品待ち＋出した依頼の受け取り確認待ち） */
export type RequestsBadge = { received: number; toConfirm: number }

/**
 * 今いるページがどのタブか（/en・/r を外して判定する）
 * 規約などどのタブでもないページは null
 */
export const requestsHubTab = (pathname: string): RequestsHubTab | null => {
  const path = pathname.replace(/^\/(?:en|ja|r)(?=\/)/, "").replace(/\/$/, "")
  if (path === "/requests" || path.startsWith("/requests/plans")) return "find"
  if (path === "/requests/new") return "find"
  if (path === "/requests/my-plans") return "mine"
  if (path === "/requests/terms") return null
  if (path.startsWith("/requests/")) return "manage"
  return null
}

/**
 * 対応が必要な依頼の数。ページを移るたびに取り直す（承諾・納品したあとに数字を減らすため）
 */
export function useRequestsBadge(): RequestsBadge | null {
  const auth = useContext(AuthContext)
  const { pathname } = useLocation()
  const [badge, setBadge] = useState<RequestsBadge | null>(null)

  useEffect(() => {
    if (!auth.isLoggedIn) return
    let alive = true
    requestsGet<RequestsBadge>({ op: "badge" })
      .then((data) => alive && setBadge(data))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [auth.isLoggedIn, pathname])

  return auth.isLoggedIn ? badge : null
}

/** レイアウトから子のページに渡すもの（useOutletContext） */
export type RequestsOutletContext = { badge: RequestsBadge | null }

/** 対応が必要な依頼の数（レイアウトで 1 回だけ取ったもの） */
export function useRequestsOutletBadge(): RequestsBadge | null {
  return useOutletContext<RequestsOutletContext | undefined>()?.badge ?? null
}

/**
 * リクエストの上のタブ（探す / 依頼の管理 / 自分のプラン）
 * スマホは 3 等分の下線タブ、PC は左に丸いタブ・右に「プランを出品する」
 */
export function RequestsHubNav(props: { badge: RequestsBadge | null }) {
  const t = useTranslation()
  const { pathname } = useLocation()
  const active = requestsHubTab(pathname)
  const badge = props.badge
  const manageCount = badge ? badge.received + badge.toConfirm : 0

  const tabs: {
    value: RequestsHubTab
    to: string
    label: string
    icon: LucideIcon
    count?: number
  }[] = [
    {
      value: "find",
      to: "/requests",
      label: t("プランを探す", "Find plans"),
      icon: Search,
    },
    {
      value: "manage",
      to: "/requests/manage",
      label: t("依頼の管理", "My requests"),
      icon: Inbox,
      count: manageCount,
    },
    {
      value: "mine",
      to: "/requests/my-plans",
      label: t("自分のプラン", "My plans"),
      icon: Store,
    },
  ]

  return (
    <nav
      aria-label={t("リクエスト", "Requests")}
      className="mx-auto flex w-full max-w-6xl items-center gap-3 px-3 md:px-6 md:pt-2"
    >
      <div className="grid flex-1 grid-cols-3 border-b md:flex md:flex-none md:gap-2 md:border-b-0">
        {tabs.map((tab) => {
          const isActive = active === tab.value
          const Icon = tab.icon
          return (
            <Link
              key={tab.value}
              to={tab.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center justify-center gap-1.5 py-3 font-bold text-sm transition-colors",
                "md:h-10 md:rounded-full md:px-4 md:py-0",
                isActive
                  ? "text-foreground md:bg-foreground md:text-background"
                  : "text-muted-foreground hover:text-foreground md:bg-muted md:text-foreground/75",
              )}
            >
              <Icon className="hidden size-4 md:block" />
              {tab.label}
              {tab.count ? (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white leading-none">
                  {tab.count}
                </span>
              ) : null}
              {isActive && (
                <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-foreground md:hidden" />
              )}
            </Link>
          )
        })}
      </div>
      <Button asChild className="ml-auto hidden rounded-full font-bold md:flex">
        <Link to="/requests/my-plans?new=1">
          <Plus className="mr-1 size-4" />
          {t("プランを出品する", "List a plan")}
        </Link>
      </Button>
    </nav>
  )
}
