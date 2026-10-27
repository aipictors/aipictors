import { Link, useLocation } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
  /** 公開しているモデル・LoRA の数 */
  modelsCount?: number
  /** 種類ごとの作品数（hasImageWorks などが実際と合わないことがあるため） */
  worksCounts?: { image: number; novel: number; video: number; column: number }
}

/**
 * ユーザーページの切り替え（作品の種類・シリーズ・モデルなど）
 * 検索エンジンがたどれるように、ボタンではなくリンクにする
 */
export function UserTabs(props: Props) {
  const user = readFragment(UserTabsFragment, props.user)
  const t = useTranslation()
  const location = useLocation()

  const base = `/users/${encodeURIComponent(user.login)}`

  const items: Array<{ path: string; label: string; show: boolean }> = [
    { path: "", label: t("ポートフォリオ", "Portfolio"), show: true },
    { path: "/posts", label: t("画像", "Images"), show: user.hasImageWorks || (props.worksCounts?.image ?? 0) > 0 },
    { path: "/novels", label: t("小説", "Novels"), show: user.hasNovelWorks || (props.worksCounts?.novel ?? 0) > 0 },
    {
      path: "/notes",
      label: t("コラム", "Columns"),
      show: user.hasColumnWorks || (props.worksCounts?.column ?? 0) > 0,
    },
    { path: "/videos", label: t("動画", "Videos"), show: user.hasVideoWorks || (props.worksCounts?.video ?? 0) > 0 },
    {
      path: "/models",
      label: t("モデル", "Models"),
      show: (props.modelsCount ?? 0) > 0,
    },
    { path: "/albums", label: t("シリーズ", "Series"), show: user.hasAlbums },
    {
      path: "/events",
      label: t("イベント", "Events"),
      show: user.hasUserEvents,
    },
    {
      path: "/collections",
      label: t("コレクション", "Collections"),
      show: user.hasFolders,
    },
    {
      path: "/stickers",
      label: t("スタンプ", "Stickers"),
      show: user.hasPublicStickers,
    },
    { path: "/badges", label: t("バッジ", "Badges"), show: user.hasBadges },
  ]

  // /en/users/xxx/posts なども同じに扱う
  const current = location.pathname
    .replace(/^\/(en|ja)(?=\/)/, "")
    .replace(/\/$/, "")
  const active =
    items
      .filter((item) => item.path !== "")
      .find((item) => current.endsWith(item.path))?.path ?? ""

  return (
    <nav
      aria-label={t("ユーザーページの項目", "Profile sections")}
      className="border-b"
    >
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items
          .filter((item) => item.show)
          .map((item) => {
            const isActive = item.path === active
            return (
              <li key={item.path || "portfolio"} className="shrink-0">
                <Link
                  to={`${base}${item.path}`}
                  prefetch="intent"
                  preventScrollReset
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex px-3 py-3 font-medium text-sm transition-colors",
                    isActive
                      ? "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {item.path === "/models" && (
                    <span className="ml-1 text-muted-foreground text-xs tabular-nums">
                      {props.modelsCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
      </ul>
    </nav>
  )
}

export const UserTabsFragment = graphql(`
  fragment UserTabsFragment on UserNode {
    id
    login
    hasImageWorks
    hasNovelWorks
    hasVideoWorks
    hasColumnWorks
    hasFolders
    hasAlbums
    hasUserEvents
    hasPublicStickers
    hasBadges
  }
`)
