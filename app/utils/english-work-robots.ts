import type { MetaDescriptor } from "@remix-run/cloudflare"

/**
 * 英語の作品ページ（/en/posts/:id、/en/r/posts/:id）は検索に載せない（日本語版と同じ作品の重複になるため）。
 * 作品・作者へのリンクはたどってもらう。日本語版の hreflang・サイトマップからも外している（app/utils/locale-path.ts）
 */
export const ENGLISH_WORK_ROBOTS = "noindex, follow"

export const isEnglishLang = (lang: string | undefined) => lang === "en"

/**
 * 英語の作品ページなら robots を noindex, follow にする。
 * もともと noindex の作品（未成年を連想させる R18 など）はそのまま
 */
export const withEnglishWorkRobots = (
  metaTags: MetaDescriptor[],
  lang: string | undefined,
): MetaDescriptor[] => {
  if (!isEnglishLang(lang)) {
    return metaTags
  }
  return metaTags.map((tag) =>
    "name" in tag &&
    tag.name === "robots" &&
    typeof tag.content === "string" &&
    !tag.content.startsWith("noindex")
      ? { ...tag, content: ENGLISH_WORK_ROBOTS }
      : tag,
  )
}
