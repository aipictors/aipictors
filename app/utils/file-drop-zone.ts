/**
 * その場で画像のドロップを受け取る領域につける属性
 * root のドロップ処理（画像をドロップすると投稿画面へ移る）は、この中へのドロップには手を出さない
 */
export const FILE_DROP_ZONE_ATTRIBUTE = "data-file-drop-zone"

type ClosestTarget = { closest: (selector: string) => unknown }

/**
 * ドロップ先がその場で受け取る領域の中か
 */
export const isInsideFileDropZone = (target: unknown): boolean => {
  if (target === null || typeof target !== "object") return false
  const closest = (target as Partial<ClosestTarget>).closest
  if (typeof closest !== "function") return false
  return closest.call(target, `[${FILE_DROP_ZONE_ATTRIBUTE}]`) != null
}

/**
 * ドロップされたファイルのうち最初の画像
 */
export const pickFirstImageFile = (
  files: ArrayLike<File> | null | undefined,
): File | null => {
  if (!files) return null
  return (
    Array.from(files).find((file) => file.type.startsWith("image/")) ?? null
  )
}
