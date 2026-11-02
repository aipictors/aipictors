import { Link, useLocation } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { getLocalePrefix } from "~/routes/($lang)._main._index/utils/content-rating-path"

/**
 * はじめての人向けの案内と、ページの下の内部リンク
 */
export function SensitiveHomeAbout(): React.ReactNode {
  const t = useTranslation()
  const location = useLocation()
  const localePrefix = getLocalePrefix(location.pathname)

  const links = [
    { to: "/r/rankings", label: t("R18 ランキング", "R18 rankings") },
    { to: "/r/themes", label: t("R18 お題", "R18 themes") },
    { to: "/r/albums", label: t("R18 シリーズ", "R18 series") },
    { to: "/r/posts/2d", label: t("R18 イラスト", "R18 illustrations") },
    { to: "/r/posts/3d", label: t("R18 フォト", "R18 photos") },
    { to: "/r/archive", label: t("R18 過去の名作", "R18 past masterpieces") },
    { to: "/guideline", label: t("投稿ガイドライン", "Posting guidelines") },
  ]

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="font-bold text-base">
        {t("このコーナーについて", "About this section")}
      </h2>
      <p className="text-muted-foreground text-sm">
        {t(
          "Aipictors（AIピクターズ）の、18歳以上の方向けのAIイラストのコーナーです。投稿された作品は新着、ランキング、タグ、シリーズから探せます。ログインすると、クリエイターやタグをフォローして新着を追えます。投稿にはガイドラインが適用され、児童の性的搾取を示唆する内容や実在の人物の無断使用は禁止されています。",
          "This is the section of Aipictors for people aged 18 and over. Find works through new posts, rankings, tags and series, and log in to follow creators and tags. All posts are subject to our guidelines, which prohibit content suggesting the sexual exploitation of children and unauthorized use of real people.",
        )}
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={`${localePrefix}${link.to}`}
              className="underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
