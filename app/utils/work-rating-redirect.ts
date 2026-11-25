import { redirect } from "@remix-run/cloudflare"

/**
 * 作品の年齢区分に合わないページ（R18 作品の /posts/N、全年齢の作品の /r/posts/N）から正しいページへ移す。
 * 検索エンジンが元の URL を残さず正しい方にまとめるよう恒久的な転送（301）にし、
 * 作者が区分を変えたときに転送が残らないようブラウザには保存させない。英語のページは英語のまま移す
 */
export const redirectToWorkRatingPath = (
  lang: string | undefined,
  isSensitive: boolean,
  workId: string,
) =>
  redirect(
    `${lang === "en" ? "/en" : ""}${isSensitive ? "/r" : ""}/posts/${workId}`,
    { status: 301, headers: { "Cache-Control": "no-store" } },
  )
