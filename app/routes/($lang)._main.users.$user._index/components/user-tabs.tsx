import { useLocation } from "@remix-run/react"
import { type FragmentOf, graphql, readFragment } from "gql.tada"
import {
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  user: FragmentOf<typeof UserTabsFragment>
  /** 公開しているモデル・LoRA の数 */
  modelsCount?: number
  /** 種類ごとの作品数（hasImageWorks などが実際と合わないことがあるため） */
  worksCounts?: { image: number; novel: number; video: number; column: number }
  /** 表示しているページの年齢区分のシリーズの数（hasAlbums は全年齢と R18 の両方を数えるため） */
  albumsCount?: number
  /**
   * R18 のページ（/r/users/:user）。行き先を /r にし、作品の有無は R18 の作品で見る。
   * R18 のページがないイベント・モデルは出さない
   */
  isSensitive?: boolean
}

/**
 * ユーザーページの切り替え（作品の種類・シリーズ・モデルなど）
 * 検索エンジンがたどれるように、ボタンではなくリンクにする。全年齢と R18 のページで同じ見た目
 */
export function UserTabs(props: Props) {
  const user = readFragment(UserTabsFragment, props.user)
  const t = useTranslation()
  const location = useLocation()

  const isSensitive = props.isSensitive === true

  const base = `${isSensitive ? "/r" : ""}/users/${encodeURIComponent(user.login)}`

  const hasWorks = {
    image: isSensitive ? user.hasSensitiveImageWorks : user.hasImageWorks,
    novel: isSensitive ? user.hasSensitiveNovelWorks : user.hasNovelWorks,
    video: isSensitive ? user.hasSensitiveVideoWorks : user.hasVideoWorks,
    column: isSensitive ? user.hasSensitiveColumnWorks : user.hasColumnWorks,
  }

  const counts: Record<string, number | undefined> = {
    "/posts": props.worksCounts?.image,
    "/novels": props.worksCounts?.novel,
    "/notes": props.worksCounts?.column,
    "/videos": props.worksCounts?.video,
    "/models": props.modelsCount,
    "/albums": props.albumsCount,
  }

  const items: Array<{ path: string; label: string; show: boolean }> = [
    { path: "", label: t("ポートフォリオ", "Portfolio"), show: true },
    {
      path: "/posts",
      label: t("画像", "Images"),
      show: hasWorks.image || (props.worksCounts?.image ?? 0) > 0,
    },
    {
      path: "/novels",
      label: t("小説", "Novels"),
      show: hasWorks.novel || (props.worksCounts?.novel ?? 0) > 0,
    },
    {
      path: "/notes",
      label: t("コラム", "Columns"),
      show: hasWorks.column || (props.worksCounts?.column ?? 0) > 0,
    },
    {
      path: "/videos",
      label: t("動画", "Videos"),
      show: hasWorks.video || (props.worksCounts?.video ?? 0) > 0,
    },
    {
      path: "/models",
      label: t("モデル", "Models"),
      show: !isSensitive && (props.modelsCount ?? 0) > 0,
    },
    {
      path: "/albums",
      label: t("シリーズ", "Series"),
      show:
        props.albumsCount === undefined
          ? user.hasAlbums
          : props.albumsCount > 0,
    },
    {
      path: "/events",
      label: t("イベント", "Events"),
      show: !isSensitive && user.hasUserEvents,
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
    <nav aria-label={t("ユーザーページの項目", "Profile sections")}>
      <ul className={appPillRowClassName}>
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
                  className={appPillTabClassName(isActive)}
                >
                  {item.label}
                  {(counts[item.path] ?? 0) > 0 && (
                    <span className="ml-1 font-medium text-xs tabular-nums opacity-70">
                      {counts[item.path]?.toLocaleString()}
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
    hasSensitiveImageWorks
    hasSensitiveNovelWorks
    hasSensitiveVideoWorks
    hasSensitiveColumnWorks
    hasFolders
    hasAlbums
    hasUserEvents
    hasPublicStickers
  }
`)
