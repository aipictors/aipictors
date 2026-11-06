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

/**
 * 画面幅ごとの列数と、その幅の間だけ隠す class
 * （Tailwind が見つけられるよう class 名はそのまま書く）
 */
export type GridColumnBreakpoint = { columns: number; hiddenClassName: string }

/** 正方形の一覧（ResponsivePhotoWorksAlbum）: 2 / sm:3 / md:4 / xl:5 / 2xl:6 */
export const SQUARE_GRID_BREAKPOINTS: GridColumnBreakpoint[] = [
  { columns: 2, hiddenClassName: "max-sm:hidden" },
  { columns: 3, hiddenClassName: "sm:max-md:hidden" },
  { columns: 4, hiddenClassName: "md:max-xl:hidden" },
  { columns: 5, hiddenClassName: "xl:max-2xl:hidden" },
  { columns: 6, hiddenClassName: "2xl:hidden" },
]

/**
 * 最後の行が埋まらない作品を、その列数の画面幅でだけ隠す class を返す
 * （ホームの各一覧で、最後の行に 1〜2 枚だけ残って穴が空かないように）。
 * 1 行に満たないときは隠さない
 */
export const incompleteRowHiddenClassName = (
  index: number,
  count: number,
  breakpoints: GridColumnBreakpoint[],
) =>
  breakpoints
    .filter(({ columns }) => {
      const filled = Math.floor(count / columns) * columns
      return filled > 0 && index >= filled
    })
    .map(({ hiddenClassName }) => hiddenClassName)
    .join(" ")
