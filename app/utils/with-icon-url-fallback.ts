import { toResizedImageUrl } from "~/utils/resized-image-url"

/**
 * アイコン画像のURLを返す
 */
export function withIconUrlFallback(
  iconUrl: string | null | undefined,
): string {
  return iconUrl ? iconUrl : "https://assets.aipictors.com/no-profile.webp"
}

/**
 * 画面に出すアイコンの URL（縮小版）。
 * アイコンは 20〜120px で出すのに元画像は 100KB 近いこともあるので、240px 幅の縮小版にする
 * （無ければ縮小の Worker が作る。RESIZED_IMAGE_FALLBACK_SCRIPT）。
 * OGP・構造化データなど元の画像が要るところは withIconUrlFallback を使う
 */
export function toIconImageUrl(
  iconUrl: string | null | undefined,
  width = 240,
): string {
  return (
    toResizedImageUrl(withIconUrlFallback(iconUrl), width) ??
    withIconUrlFallback(iconUrl)
  )
}
