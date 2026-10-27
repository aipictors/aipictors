import { Link, useLocation } from "@remix-run/react"
import {
  BellIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  EyeIcon,
  FolderIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  ImageIcon,
  LibraryIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  outlet: React.ReactNode
}>

type NavItem = {
  to: string
  ja: string
  en: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: "/my", ja: "ホーム", en: "Home", icon: HomeIcon },
  { to: "/my/posts", ja: "作品", en: "Posts", icon: ImageIcon },
  { to: "/my/albums", ja: "シリーズ", en: "Albums", icon: LibraryIcon },
  { to: "/my/folders", ja: "コレクション", en: "Folders", icon: FolderIcon },
  {
    to: "/my/bookmarks",
    ja: "ブックマーク",
    en: "Bookmarks",
    icon: BookmarkIcon,
  },
  { to: "/my/likes", ja: "いいね", en: "Likes", icon: HeartIcon },
  { to: "/my/recommended", ja: "推薦", en: "Recommended", icon: ThumbsUpIcon },
  { to: "/my/views", ja: "閲覧履歴", en: "Views", icon: EyeIcon },
  { to: "/my/events", ja: "イベント", en: "Events", icon: CalendarDaysIcon },
  { to: "/my/histories", ja: "操作履歴", en: "History", icon: HistoryIcon },
  {
    to: "/my/reports",
    ja: "運営からのお知らせ",
    en: "Reports",
    icon: BellIcon,
  },
]

/**
 * いま開いているマイページの項目（/my は完全一致、それ以外は前方一致。/en などの言語付きも同じ）
 */
const isActive = (pathname: string, to: string) => {
  const path = pathname.replace(/^\/(en|ja)(?=\/|$)/, "") || "/"
  if (to === "/my") return path === "/my" || path === "/my/"
  return path === to || path.startsWith(`${to}/`)
}

/**
 * マイページの枠（項目の切り替え）
 * スマホでもパソコンでも同じ 1 行の切り替えにして、横にスクロールできるようにする
 */
export function MyContents(props: Props) {
  const authContext = useContext(AuthContext)
  const location = useLocation()
  const t = useTranslation()

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    !authContext.userId
  ) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <nav
        aria-label={t("マイページの項目", "My page sections")}
        className="-mx-2 sticky top-16 z-20 border-b bg-background/90 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      >
        <ul className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const active = isActive(location.pathname, item.to)
            const Icon = item.icon
            return (
              <li key={item.to} className="shrink-0">
                <Link
                  to={item.to}
                  prefetch="intent"
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 font-medium text-sm transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {t(item.ja, item.en)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      {props.outlet}
    </div>
  )
}
