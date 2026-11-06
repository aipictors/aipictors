/**
 * 作品一覧のサムネイルの並べ方
 * - square: 正方形に切り抜いて格子状に並べる（既定）
 * - justified: 元の縦横比のまま、行の高さを揃えて並べる
 *
 * サーバーでも同じ並べ方で描画できるよう cookie に保存する（表示後に並べ直してずれないように）。
 * ページのキャッシュもこの値ごとに分ける（app/lib/edge-page-cache.ts）
 */
export type GridLayout = "square" | "justified"

export const GRID_LAYOUT_COOKIE = "aip_grid"

export const parseGridLayout = (
  cookie: string | null | undefined,
): GridLayout =>
  /(?:^|;\s*)aip_grid=justified(?:;|$)/.test(cookie ?? "")
    ? "justified"
    : "square"

export const getGridLayout = (request: Request): GridLayout =>
  parseGridLayout(request.headers.get("cookie"))
