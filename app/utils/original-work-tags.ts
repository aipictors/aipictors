/**
 * オリジナル作品とみなすタグ（作品にオリジナル・二次創作の区別の項目が無いので、タグで判定する）。
 * works の where.tagNames はタグの OR（どれか 1 つが付いていれば一致。大文字・小文字は区別しない）。
 * 全年齢・R15 の作品数（2026-11-25）: オリジナル 46,026 / オリジナルキャラ 8,308 / オリジナルキャラクター 1,686 /
 * 創作 1,123 / 一次創作 632 / オリキャラ 583 / original 208、合わせて 55,857（全 616,458）
 */
export const ORIGINAL_WORK_TAG_NAMES = [
  "オリジナル",
  "オリジナルキャラ",
  "オリジナルキャラクター",
  "オリキャラ",
  "創作",
  "一次創作",
  "original",
]

const originalTagSet = new Set(
  ORIGINAL_WORK_TAG_NAMES.map((name) => name.toLowerCase()),
)

/**
 * オリジナル系のタグが 1 つでも付いているか（サーバーで絞れない一覧をブラウザで絞るとき）
 */
export function isOriginalWork(tagNames: readonly string[] | null | undefined) {
  if (!tagNames) return false
  return tagNames.some((name) => originalTagSet.has(name.trim().toLowerCase()))
}
