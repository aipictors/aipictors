import type { MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

type ParentUser = {
  name?: string
  login?: string
  iconUrl?: string | null
  headerImageUrl?: string | null
}

/**
 * ユーザーページの各タブのタイトル・説明文（親のユーザー情報を使う）
 * 例: 「admin（@admin）の小説一覧（2ページ目）」
 * R18 のページ（/r/users/:user）は isSensitive。親は R18 のレイアウトで、og:image は既定の画像にする
 */
export const createUserTabMeta =
  (ja: string, en: string, options?: { isSensitive?: boolean }): MetaFunction =>
  (props) => {
    const isSensitive = options?.isSensitive === true
    const parentId = isSensitive
      ? "routes/($lang).r.users.$user"
      : "routes/($lang)._main.users.$user"
    const parent = props.matches.find((match) => match.id === parentId)?.data as
      | { user?: ParentUser }
      | undefined
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

    const r18Ja = isSensitive ? "R18の" : ""
    const r18En = isSensitive ? "R18 " : ""

    return (isSensitive ? createSensitiveMeta : createMeta)(
      META.USERS,
      {
        title: `${name}（@${user.login}）の${r18Ja}${ja}一覧${pageJa}`,
        enTitle: `${r18En}${en} by ${name} (@${user.login})${pageEn}`,
        description: `${name}（@${user.login}）さんがAipictorsに投稿した${r18Ja}${ja}の一覧です。`,
        enDescription: `${r18En}${en} posted by ${name} (@${user.login}) on Aipictors.`,
        url: user.headerImageUrl ?? user.iconUrl ?? "",
      },
      props.params.lang,
    )
  }
