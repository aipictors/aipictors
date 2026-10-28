/**
 * サーバーで描画するときに、スマホ用・PC 用のどちらの一覧を出すかの目安
 *
 * 画面幅で出し分けている一覧（hidden md:block / md:hidden）は両方を HTML に入れると、
 * 見えない側も読み込み・hydration の負担になる（ホームでは要素の 3 分の 1 以上が見えない側だった）。
 * 端末の種類で片方だけを描画し、実際の画面幅と違ったら表示後に切り替える（app/hooks/use-layout-variant.ts）。
 * ページのキャッシュもこの値ごとに分ける（app/lib/edge-page-cache.ts）
 */
export type LayoutHint = "mobile" | "desktop"

export const getLayoutHint = (request: Request): LayoutHint => {
  const clientHint = request.headers.get("sec-ch-ua-mobile")
  if (clientHint === "?1") return "mobile"
  const userAgent = request.headers.get("user-agent") ?? ""
  return /Mobi|iPhone|iPod|Android.+Mobile|Windows Phone/i.test(userAgent)
    ? "mobile"
    : "desktop"
}
