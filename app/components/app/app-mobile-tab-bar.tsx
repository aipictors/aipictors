import { useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import {
  BellIcon,
  HomeIcon,
  SearchIcon,
  UserRoundIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { viewerUnreadNotificationCountsQuery } from "~/routes/($lang)._main._index/components/home-header"
import {
  toBadgeText,
  toUnreadTotal,
} from "~/routes/($lang)._main._index/components/home-notifications-panel-utils"
import { useIsEditingTextField } from "~/routes/($lang).generation._index/hooks/use-is-editing-text-field"
import { parseLocalePath } from "~/utils/locale-path"

/**
 * 下のタブを出さないページ（自分の送信ボタンが画面下にあるページ・手続き中のページ）
 */
const HIDDEN_PATH_PATTERN =
  /^\/(?:new|plus|settings|support|contact|admin|app|flutter|generation\/demonstration)(?:\/|$)|^\/posts\/[^/]+\/(?:image|animation|text|video)?\.?edit/

type TabKey = "home" | "search" | "generation" | "notifications" | "my"

const toActiveTab = (remainder: string, myPaths: string[]): TabKey | null => {
  if (
    remainder === "/" ||
    /^\/(?:home|new-works|following|recommended)(?:\/|$)/.test(remainder)
  ) {
    return "home"
  }
  if (/^\/(?:search|tags)(?:\/|$)/.test(remainder)) return "search"
  if (/^\/generation(?:\/|$)/.test(remainder)) return "generation"
  if (/^\/notifications(?:\/|$)/.test(remainder)) return "notifications"
  if (/^\/my(?:\/|$)/.test(remainder)) return "my"
  if (
    myPaths.some(
      (path) => remainder === path || remainder.startsWith(`${path}/`),
    )
  ) {
    return "my"
  }
  return null
}

/**
 * スマホの画面下のタブ（アプリと同じ ホーム・探す・生成・通知・マイページ）
 *
 * 片手で届く位置に主な行き先を置く。PC では描画しない（CSS でも md:hidden）。
 * 通知の数はヘッダーが取った結果を Apollo のキャッシュから読むだけで、API は呼ばない。
 * 高さは html の --aip-tabbar-h（tailwind.css）で、本文の下の余白と画面下に出す案内の位置に使う
 */
export function AppMobileTabBar() {
  const t = useTranslation()
  const location = useLocation()
  const authContext = useContext(AuthContext)
  const { showMobile } = useLayoutVariant()
  // アプリと同じく、キーボードが出ている間は隠す（生成画面の送信欄もこのとき隠れる）
  const isEditingTextField = useIsEditingTextField()

  const { remainder, isSensitive } = parseLocalePath(location.pathname)

  const unread = useQuery(viewerUnreadNotificationCountsQuery, {
    skip: !authContext.isLoggedIn,
    fetchPolicy: "cache-only",
  })
  const counts = unread.data?.viewer?.unreadNotificationCounts
  const unreadTotal = counts ? toUnreadTotal(counts) : 0

  if (!showMobile || HIDDEN_PATH_PATTERN.test(remainder)) {
    return null
  }

  // トークンの login は ID を変えた後も古いままなので、行き先は変わらない数値の ID にする
  const myPath = authContext.isLoggedIn ? `/users/${authContext.userId}` : null
  const active = toActiveTab(
    remainder,
    authContext.isLoggedIn
      ? [`/users/${authContext.userId}`, `/users/${authContext.login}`]
      : [],
  )
  const prefix = isSensitive ? "/r" : ""

  const tabs: {
    key: TabKey
    to: string
    label: string
    icon: typeof HomeIcon
  }[] = [
    {
      key: "home",
      to: prefix || "/",
      label: t("ホーム", "Home"),
      icon: HomeIcon,
    },
    {
      key: "search",
      to: `${prefix}/search`,
      label: t("探す", "Explore"),
      icon: SearchIcon,
    },
    {
      key: "generation",
      to: "/generation",
      label: t("生成", "Create"),
      icon: WandSparklesIcon,
    },
    {
      key: "notifications",
      to: "/notifications",
      label: t("通知", "Alerts"),
      icon: BellIcon,
    },
    {
      key: "my",
      to: myPath ?? "/my",
      label: t("マイページ", "My page"),
      icon: UserRoundIcon,
    },
  ]

  return (
    <nav
      aria-label={t("メインメニュー", "Main menu")}
      className={cn(
        "aip-tabbar fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
        // 外すと --aip-tabbar-h が変わって画面が動くので、残したまま見えなくする
        isEditingTextField && "invisible",
      )}
    >
      <ul className="mx-auto grid h-14 max-w-lg grid-cols-5">
        {tabs.map((tab) => {
          const isActive = active === tab.key
          const Icon = tab.icon
          return (
            <li key={tab.key} className="min-w-0">
              <Link
                to={tab.to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 font-medium text-[10px] leading-none transition-colors active:scale-95 motion-reduce:transition-none",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {tab.key === "generation" ? (
                  // アプリと同じ、真ん中だけ色の付いた丸いボタン
                  <span className="flex h-7 w-11 items-center justify-center rounded-full bg-linear-to-br from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] text-white shadow-sm">
                    <Icon className="size-[18px]" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      isActive && "bg-muted",
                    )}
                  >
                    <Icon
                      className="size-[22px]"
                      strokeWidth={isActive ? 2.4 : 1.9}
                    />
                    {tab.key === "notifications" && unreadTotal > 0 && (
                      <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-bold text-[10px] text-white tabular-nums ring-2 ring-background">
                        {toBadgeText(unreadTotal)}
                      </span>
                    )}
                  </span>
                )}
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
