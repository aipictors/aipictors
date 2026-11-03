export type GenerationSize = {
  width: number
  height: number
}

/** 幅・高さを指定するサイズの範囲（サーバーの lib/image-generation-size.ts と同じ） */
export const customGenerationSizeMin = 512
export const customGenerationSizeMax = 2500
export const customGenerationSizeStep = 8
/** サブスクでない人の上限（高解像度の拡大後を含む） */
export const freeGenerationMaxPixels = 2048 * 2048
/** 1 枚ずつになり、コインが増えていく面積の単位（サーバーと同じ） */
export const generationPixelsPerCoinUnit = 1_600_000

const customSizePrefix = "CUSTOM"

export const parseGenerationSize = (
  size: string, // 例："SD1_512_512"、"CUSTOM_1100_1400"
): GenerationSize => {
  const parts = size.split("_")
  const upscale = parts[0] === "SD1" ? 1.5 : 1
  const width = Number.parseInt(parts[1], 10) * upscale
  const height = Number.parseInt(parts[2], 10) * upscale
  return { width, height }
}

/**
 * 幅・高さを指定したサイズ（サーバーの種類の一覧にはない）
 */
export const toCustomSizeType = (width: number, height: number) => {
  return `${customSizePrefix}_${width}_${height}`
}

export const isCustomSizeType = (sizeType: string) => {
  return sizeType.startsWith(`${customSizePrefix}_`)
}

/**
 * 8 の倍数にそろえて範囲に収める
 */
export const normalizeCustomSide = (value: number) => {
  const stepped =
    Math.round(value / customGenerationSizeStep) * customGenerationSizeStep
  return Math.min(
    Math.floor(customGenerationSizeMax / customGenerationSizeStep) *
      customGenerationSizeStep,
    Math.max(customGenerationSizeMin, stepped),
  )
}

/**
 * 依頼に載せるサイズ（幅・高さの指定か、サイズの種類か）
 */
export const toGenerationSizeInput = <T extends string>(sizeType: string) => {
  if (isCustomSizeType(sizeType)) {
    const { width, height } = parseGenerationSize(sizeType)
    return { width, height }
  }
  return { sizeType: sizeType as T }
}

/**
 * 作った依頼のサイズを設定の値に戻す
 * 幅・高さを指定した依頼は sizeType が実際のサイズと合わないので width / height を見る
 */
export const toTaskSizeType = (task: {
  sizeType: string
  width?: number | null
  height?: number | null
}) => {
  if (!task.width || !task.height) return task.sizeType
  const parts = task.sizeType.split("_")
  if (
    Number.parseInt(parts[1], 10) === task.width &&
    Number.parseInt(parts[2], 10) === task.height
  ) {
    return task.sizeType
  }
  return toCustomSizeType(task.width, task.height)
}

/**
 * サブスクでない人が高解像度にすると上限を超えるか
 */
export const isUpscaleOverFreeLimit = (
  sizeType: string,
  isPaidPlan: boolean,
) => {
  if (isPaidPlan) return false
  const { width, height } = parseGenerationSize(sizeType)
  return width * 2 * height * 2 > freeGenerationMaxPixels
}
