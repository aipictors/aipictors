import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

type ParentUser = {
  name?: string
  login?: string
  iconUrl?: string | null
  headerImageUrl?: string | null
}

/**
 * ユーザーページの各タブのタイトル・説明文（親のユーザー情報を使う）
 * 例: 「admin（@admin）の小説一覧（2ページ目）」
 */
export const createUserTabMeta =
  (ja: string, en: string): MetaFunction =>
  (props) => {
    const parent = props.matches.find(
      (match) => match.id === "routes/($lang)._main.users.$user",
    )?.data as { user?: ParentUser } | undefined
    const user = parent?.user
    if (!user?.login) return []

    const name = user.name && user.name.length > 0 ? user.name : user.login
    const page = Number.parseInt(
      new URLSearchParams(props.location.search).get("page") ?? "0",
      10,
    )
    const pageJa =
      Number.isFinite(page) && page > 0 ? `（${page + 1}ページ目）` : ""
    const pageEn =
      Number.isFinite(page) && page > 0 ? ` (page ${page + 1})` : ""

    return createMeta(
      META.USERS,
      {
        title: `${name}（@${user.login}）の${ja}一覧${pageJa}`,
        enTitle: `${en} by ${name} (@${user.login})${pageEn}`,
        description: `${name}（@${user.login}）さんがAipictorsに投稿した${ja}の一覧です。`,
        enDescription: `${en} posted by ${name} (@${user.login}) on Aipictors.`,
        url: user.headerImageUrl ?? user.iconUrl ?? "",
      },
      props.params.lang,
    )
  }
