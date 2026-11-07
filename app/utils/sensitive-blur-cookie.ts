/**
 * センシティブな作品（画像の自動判定で、リアルな作風で子どもに見える人物の際どい表現の疑いとしたもの）を
 * 一覧や作品ページでぼかすかどうか。既定はぼかす。
 *
 * サーバーでも同じ状態で描画できるよう cookie に保存する（表示後にぼかしが外れたり付いたりしないように）。
 * ページのキャッシュもこの値ごとに分ける（app/lib/edge-page-cache.ts）。
 * edge-page-cache から読むので、config（env）を読み込まないこと
 */
export const SENSITIVE_BLUR_COOKIE = "aip_blur"

export const parseSensitiveBlur = (cookie: string | null | undefined) =>
  !/(?:^|;\s*)aip_blur=off(?:;|$)/.test(cookie ?? "")

export const getSensitiveBlur = (request: Request) =>
  parseSensitiveBlur(request.headers.get("cookie"))
