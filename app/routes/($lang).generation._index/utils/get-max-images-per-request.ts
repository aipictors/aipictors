/**
 * 1 回の生成で作れる枚数の上限（サーバーと同じ決まり）
 * 無料 2 枚・ライト以上 4 枚。高解像度・画像から生成・ControlNet・Seed 指定・FLUX・Gemini は 1 枚
 */
export const getMaxImagesPerRequest = (props: {
  modelKey: string
  modelType: string
  generationType: string
  upscaleSize: number | null
  hasControlNet: boolean
  /** Seed を指定している（-1 以外） */
  isSeedFixed: boolean
  isPaidPlan: boolean
}) => {
  const modelKey = props.modelKey.toLowerCase()
  if (
    modelKey.startsWith("flux") ||
    modelKey.includes("gemini") ||
    props.modelType === "GEMINI" ||
    props.modelType === "SD5" ||
    props.modelType === "FLUX"
  ) {
    return 1
  }
  if (props.generationType !== "TEXT_TO_IMAGE") return 1
  if (props.upscaleSize !== null && props.upscaleSize > 1) return 1
  if (props.hasControlNet) return 1
  // Seed を決めて作るときは同じ絵を出したいので 1 枚ずつ
  if (props.isSeedFixed) return 1
  return props.isPaidPlan ? 4 : 2
}

/**
 * 選んだ枚数を 1〜上限に収める（未選択なら上限＝まとめて）
 */
export const resolveImagesPerRequest = (
  selected: number | null,
  max: number,
) => {
  if (selected === null || !Number.isFinite(selected)) return max
  return Math.min(max, Math.max(1, Math.floor(selected)))
}
