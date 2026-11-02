import { useQuery } from "@apollo/client/index"
import { Link, useLocation } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BellIcon,
  BookmarkXIcon,
  BoxesIcon,
  ChevronRight,
  CoinsIcon,
  EyeIcon,
  Gift,
  MedalIcon,
  MessagesSquareIcon,
  PaletteIcon,
  Radio,
  StickerIcon,
  TagIcon,
  UserIcon,
  UserRoundCogIcon,
  UserXIcon,
} from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { findSettingsPageHref } from "~/routes/($lang).settings._index/utils/settings-pages"

/**
 * 設定のメニュー。スマホは押しやすい行、PC は今いる項目が分かる細いメニュー
 */
export function SettingsNavigation() {
  const { data } = useQuery(viewerIsAdvertiserQuery)
  const t = useTranslation()
  const location = useLocation()
  const activeHref = findSettingsPageHref(location.pathname)

  const groups = [
    {
      title: t("アカウント", "Account"),
      items: [
        { href: "/settings/profile", icon: UserIcon, label: t("プロフィール", "Profile") },
        { href: "/settings/account", icon: UserRoundCogIcon, label: t("アカウント設定", "Account Settings") },
        { href: "/settings/discord", icon: MessagesSquareIcon, label: t("Discord 連携", "Discord") },
      ],
    },
    {
      title: t("コイン・サポート", "Coins & Support"),
      items: [
        { href: "/settings/points", icon: CoinsIcon, label: t("コイン", "Coins") },
        { href: "/settings/request", icon: MedalIcon, label: t("サポートを受け取る", "Receive Support") },
        { href: "/settings/support-received", icon: Gift, label: t("応援コイン受け取り", "Received Support Coins") },
        ...(data?.viewer?.isAdvertiser
          ? [{ href: "/settings/advertisements", icon: Radio, label: t("広告設定", "Advertisement Settings") }]
          : []),
      ],
    },
    {
      title: t("表示・通知", "Display & Notifications"),
      items: [
        { href: "/settings/notification", icon: BellIcon, label: t("通知・いいね", "Notifications & Likes") },
        { href: "/settings/restriction", icon: EyeIcon, label: t("表示コンテンツ", "Display Content") },
        { href: "/settings/color", icon: PaletteIcon, label: t("カラーテーマ", "Color Theme") },
      ],
    },
    {
      title: t("フォロー・ミュート", "Follow & Mute"),
      items: [
        { href: "/settings/followed/tags", icon: TagIcon, label: t("フォロータグ", "Followed Tags") },
        { href: "/settings/muted/users", icon: UserXIcon, label: t("ユーザミュート", "Muted Users") },
        { href: "/settings/blocked/users", icon: UserXIcon, label: t("ユーザブロック", "Blocked Users") },
        { href: "/settings/muted/tags", icon: BookmarkXIcon, label: t("タグミュート", "Muted Tags") },
      ],
    },
    {
      title: t("つくったもの", "Your Creations"),
      items: [
        { href: "/settings/sticker", icon: StickerIcon, label: t("スタンプ", "Stickers") },
        { href: "/models/library?section=mine", icon: BoxesIcon, label: t("自分のモデル", "My Models") },
      ],
    },
  ]

  return (
    <nav
      aria-label={t("設定", "Settings")}
      className="w-full space-y-4 md:space-y-2"
    >
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-1 font-medium text-muted-foreground text-xs md:px-2">
            {group.title}
          </p>
          <ul className="divide-y overflow-hidden rounded-xl border md:divide-y-0 md:rounded-none md:border-0">
            {group.items.map((item) => {
              const isActive = activeHref === item.href
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-3 px-3 text-sm transition-colors hover:bg-muted/60 md:min-h-8 md:rounded-md md:px-2",
                      isActive && "md:bg-muted md:font-medium",
                    )}
                  >
                    <item.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground md:hidden" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

const viewerIsAdvertiserQuery = graphql(
  `query ViewerIsAdvertiser {
    viewer {
      id
      isAdvertiser
    }
  }`,
)
