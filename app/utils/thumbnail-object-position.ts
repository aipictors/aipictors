/**
 * 「サムネイルを調整」で保存した位置を、一覧のサムネイルの CSS object-position にする
 *
 * 保存される値は、調整の画面（正方形の枠）で画像をずらした量で、画像の長辺に対する % の負の値
 * （0 で上端・左端、中央は縦長なら -(1 - 幅 / 高さ) × 50）。
 * 縦長は上下、横長は左右の位置になる。枠が正方形でなくても、はみ出す分に対して同じ割合の位置にする
 */
export const toThumbnailObjectPosition = (
  position: number | null | undefined,
  width: number,
  height: number,
): string => {
  if (!(width > 0) || !(height > 0) || width === height) return "50% 50%"
  // 正方形の枠ではみ出す分（画像の長辺に対する割合）
  const overflow = width > height ? 1 - height / width : 1 - width / height
  const offset = -(Number.isFinite(position) ? (position as number) : 0) / 100
  const percent = Math.min(Math.max(offset / overflow, 0), 1) * 100
  const value = `${Number(percent.toFixed(2))}%`
  return width > height ? `${value} 50%` : `50% ${value}`
}
