import { useQuery } from "@apollo/client/index"
import { useLocation } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  BanknoteIcon,
  BellIcon,
  BookmarkXIcon,
  BoxesIcon,
  ChevronRight,
  ClipboardListIcon,
  CoinsIcon,
  EyeIcon,
  EyeOffIcon,
  Gift,
  MessagesSquareIcon,
  PaletteIcon,
  Radio,
  StickerIcon,
  TagIcon,
  UserIcon,
  UserRoundCogIcon,
  UserXIcon,
} from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { findSettingsPageHref } from "~/routes/($lang).settings._index/utils/settings-pages"

/** まとまりごとのアイコンの色（スマホだけ。PC は今いる項目だけ色を付ける） */
const GROUP_TONES = [
  "max-md:bg-sky-500/15 max-md:text-sky-600 max-md:dark:text-sky-300",
  "max-md:bg-amber-500/15 max-md:text-amber-600 max-md:dark:text-amber-300",
  "max-md:bg-violet-500/15 max-md:text-violet-600 max-md:dark:text-violet-300",
  "max-md:bg-rose-500/15 max-md:text-rose-600 max-md:dark:text-rose-300",
  "max-md:bg-emerald-500/15 max-md:text-emerald-600 max-md:dark:text-emerald-300",
]

/**
 * 設定のメニュー。スマホは色付きアイコンの押しやすい行（上に自分のプロフィール）、
 * PC は今いる項目が分かる細いメニュー
 */
export function SettingsNavigation() {
  const { data } = useQuery(viewerIsAdvertiserQuery)
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const location = useLocation()
  const activeHref = findSettingsPageHref(location.pathname)

  const groups = [
    {
      title: t("アカウント", "Account"),
      items: [
        {
          href: "/settings/profile",
          icon: UserIcon,
          label: t("プロフィール", "Profile"),
        },
        {
          href: "/settings/account",
          icon: UserRoundCogIcon,
          label: t("アカウント設定", "Account Settings"),
        },
        {
          href: "/settings/discord",
          icon: MessagesSquareIcon,
          label: t("Discord 連携", "Discord"),
        },
      ],
    },
    {
      title: t("コイン・サポート", "Coins & Support"),
      items: [
        {
          href: "/settings/points",
          icon: CoinsIcon,
          label: t("コイン", "Coins"),
        },
        {
          href: "/settings/support-received",
          icon: Gift,
          label: t("応援コイン受け取り", "Received Support Coins"),
        },
        {
          href: "/settings/creator-rewards",
          icon: BanknoteIcon,
          label: t(
            "収益の受け取り（クリエイター報酬）",
            "Rewards payout (Creator Rewards)",
          ),
        },
        {
          // プランの作成はリクエストの「自分のプラン」に移した（設定から探す人のために入口だけ残す）
          href: "/requests/my-plans",
          icon: ClipboardListIcon,
          label: t("リクエストとプラン", "Requests & Plans"),
        },
        ...(data?.viewer?.isAdvertiser
          ? [
              {
                href: "/settings/advertisements",
                icon: Radio,
                label: t("広告設定", "Advertisement Settings"),
              },
            ]
          : []),
      ],
    },
    {
      title: t("表示・通知", "Display & Notifications"),
      items: [
        {
          href: "/settings/notification",
          icon: BellIcon,
          label: t("通知・いいね", "Notifications & Likes"),
        },
        {
          href: "/settings/restriction",
          icon: EyeIcon,
          label: t("表示コンテンツ", "Display Content"),
        },
        {
          // 推しを見たくない人が「応援コイン受け取り」の中から探さなくて済むよう、表示のまとまりにも入口を置く
          href: "/settings/support-received#hide-coin-support",
          icon: EyeOffIcon,
          label: t("推し・推しランキングの表示", "Support display"),
        },
        {
          href: "/settings/color",
          icon: PaletteIcon,
          label: t("カラーテーマ", "Color Theme"),
        },
      ],
    },
    {
      title: t("フォロー・ミュート", "Follow & Mute"),
      items: [
        {
          href: "/settings/followed/tags",
          icon: TagIcon,
          label: t("お気に入りタグ", "Followed Tags"),
        },
        {
          href: "/settings/muted/users",
          icon: UserXIcon,
          label: t("ユーザミュート", "Muted Users"),
        },
        {
          href: "/settings/blocked/users",
          icon: UserXIcon,
          label: t("ユーザブロック", "Blocked Users"),
        },
        {
          href: "/settings/muted/tags",
          icon: BookmarkXIcon,
          label: t("タグミュート", "Muted Tags"),
        },
      ],
    },
    {
      title: t("つくったもの", "Your Creations"),
      items: [
        {
          href: "/settings/sticker",
          icon: StickerIcon,
          label: t("スタンプ", "Stickers"),
        },
        {
          href: "/models/library?section=mine",
          icon: BoxesIcon,
          label: t("自分のモデル", "My Models"),
        },
      ],
    },
  ]

  return (
    <nav
      aria-label={t("設定", "Settings")}
      className="w-full space-y-5 md:space-y-4"
    >
      {authContext.isLoggedIn && (
        <Link
          to="/settings/profile"
          className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-colors hover:bg-muted/60 md:hidden"
        >
          <img
            src={authContext.avatarPhotoURL}
            alt=""
            className="size-12 shrink-0 rounded-full bg-muted object-cover"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">
              {authContext.displayName}
            </span>
            <span className="block truncate text-muted-foreground text-xs">
              {t(
                "プロフィール・アイコン枠・ヘッダー枠",
                "Profile, avatar & header frames",
              )}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      )}
      {groups.map((group, groupIndex) => {
        const tone = GROUP_TONES[groupIndex % GROUP_TONES.length]
        return (
          <div key={group.title}>
            <p className="mb-1.5 px-1 font-semibold text-[11px] text-muted-foreground tracking-wide md:px-3">
              {group.title}
            </p>
            <ul className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm md:space-y-0.5 md:divide-y-0 md:overflow-visible md:rounded-none md:border-0 md:bg-transparent md:shadow-none">
              {group.items.map((item) => {
                const isActive = activeHref === item.href
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex min-h-12 items-center gap-3 px-3 text-sm transition-colors hover:bg-muted/60 md:min-h-9 md:rounded-lg md:px-3",
                        isActive &&
                          "md:bg-primary/10 md:font-semibold md:text-primary md:hover:bg-primary/15",
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="-translate-y-1/2 absolute top-1/2 left-0 hidden h-5 w-1 rounded-full bg-primary md:block"
                        />
                      )}
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg md:size-auto",
                          tone,
                          isActive
                            ? "md:text-primary"
                            : "md:text-muted-foreground md:group-hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-4" />
                      </span>
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
        )
      })}
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
