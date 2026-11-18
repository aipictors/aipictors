/**
 * ページ番号の入力（1 始まり、全角数字も可）を 0 始まりのページ番号にする。
 * 範囲外は最初か最後のページに寄せ、数字でなければ null
 */
export const parsePageJump = (
  text: string,
  pageCount: number,
): number | null => {
  const digits = text
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
  if (!/^\d+$/.test(digits) || pageCount <= 0) return null
  const page = Number(digits)
  return Math.min(Math.max(page, 1), pageCount) - 1
}
