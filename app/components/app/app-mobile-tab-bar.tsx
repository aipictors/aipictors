import { useLocation } from "@remix-run/react"
import {
  HomeIcon,
  SearchIcon,
  SquarePlusIcon,
  UserRoundIcon,
  WandSparklesIcon,
} from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useLayoutVariant } from "~/hooks/use-layout-variant"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { useIsEditingTextField } from "~/routes/($lang).generation._index/hooks/use-is-editing-text-field"
import { parseLocalePath } from "~/utils/locale-path"
import { isMobileTabBarHiddenPath } from "~/utils/mobile-tab-bar-hidden-path"

type TabKey = "home" | "search" | "generation" | "post" | "my"

const toActiveTab = (remainder: string, myPaths: string[]): TabKey | null => {
  if (
    remainder === "/" ||
    /^\/(?:home|new-works|following|recommended)(?:\/|$)/.test(remainder)
  ) {
    return "home"
  }
  if (/^\/(?:search|tags)(?:\/|$)/.test(remainder)) return "search"
  if (/^\/generation(?:\/|$)/.test(remainder)) return "generation"
  if (/^\/new(?:\/|$)/.test(remainder)) return "post"
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
 * スマホの画面下のタブ（ホーム・探す・生成・投稿・マイページ）
 *
 * 片手で届く位置に主な行き先を置く。PC では描画しない（CSS でも md:hidden）。
 * 生成と投稿を隣に並べる。通知はヘッダーのベルからその場で開く（ページを移らずに確認できる）。
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

  if (!showMobile || isMobileTabBarHiddenPath(remainder)) {
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
      key: "post",
      to: "/new/image",
      label: t("投稿", "Post"),
      icon: SquarePlusIcon,
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
