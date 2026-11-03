import { parseGenerationSize } from "~/routes/($lang).generation._index/types/generation-size"

/**
 * モデルの種類ごとに選べるサイズ
 */
const sizeOptionsByModelType: Record<
  string,
  { square: string[]; portrait: string[]; landscape: string[] }
> = {
  SD1: {
    square: ["SD1_512_512"],
    portrait: ["SD1_512_768", "SD1_384_960"],
    landscape: ["SD1_768_512", "SD1_960_384"],
  },
  SD2: {
    square: ["SD2_768_768"],
    portrait: ["SD2_768_1200"],
    landscape: ["SD2_1200_768"],
  },
  SDXL: {
    square: ["SD3_1024_1024"],
    portrait: ["SD3_896_1152", "SD3_832_1216", "CUSTOM_768_1344", "SD3_640_1536"],
    landscape: ["SD3_1152_896", "SD3_1216_832", "CUSTOM_1344_768", "SD3_1536_640"],
  },
  FLUX: {
    square: ["SD4_896_896"],
    portrait: ["SD4_896_1152"],
    landscape: ["SD4_1152_896"],
  },
  SD5: {
    square: ["SD3_1024_1024"],
    portrait: ["SD3_832_1216"],
    landscape: ["SD3_1216_832"],
  },
  GEMINI: {
    square: ["SD3_1024_1024"],
    portrait: ["SD3_832_1216"],
    landscape: ["SD3_1216_832"],
  },
}

type GenerationSizeOption = {
  sizeType: string
  width: number
  height: number
  /** 見た目の比率（例: 2:3） */
  ratioLabel: string
}

const COMMON_RATIOS: [number, number][] = [
  [1, 1],
  [2, 3],
  [3, 2],
  [3, 4],
  [4, 3],
  [9, 16],
  [16, 9],
  [5, 12],
  [12, 5],
  [2, 5],
  [5, 2],
  [5, 7],
  [7, 5],
]

/**
 * 近い比率の表記（832×1216 → 2:3）
 */
export const toRatioLabel = (width: number, height: number) => {
  const ratio = width / Math.max(1, height)
  let best = COMMON_RATIOS[0]
  let bestDiff = Number.POSITIVE_INFINITY
  for (const candidate of COMMON_RATIOS) {
    const diff = Math.abs(
      Math.log(ratio) - Math.log(candidate[0] / candidate[1]),
    )
    if (diff < bestDiff) {
      best = candidate
      bestDiff = diff
    }
  }
  return `${best[0]}:${best[1]}`
}

/**
 * 幅・高さを指定できるモデル（FLUX と Gemini は決まったサイズのみ）
 */
export const canUseCustomGenerationSize = (modelType: string) => {
  return modelType === "SD1" || modelType === "SD2" || modelType === "SDXL"
}

/**
 * 選べるサイズを縦長 → 正方形 → 横長の順に
 */
export const getGenerationSizeOptions = (
  modelType: string,
): GenerationSizeOption[] => {
  const options =
    sizeOptionsByModelType[modelType] ?? sizeOptionsByModelType.SDXL
  const all = Array.from(
    new Set([...options.portrait, ...options.square, ...options.landscape]),
  )
  return all
    .map((sizeType) => {
      const size = parseGenerationSize(sizeType)
      const width = Math.round(size.width)
      const height = Math.round(size.height)
      return {
        sizeType,
        width,
        height,
        ratioLabel: toRatioLabel(width, height),
      }
    })
    .sort((a, b) => a.width / a.height - b.width / b.height)
}

/**
 * 一番近い比率の選択肢
 */
export const findNearestSizeType = (
  options: GenerationSizeOption[],
  size: { width: number; height: number } | undefined,
) => {
  if (!size) return options[0]?.sizeType ?? "SD3_1024_1024"
  const ratio = Math.log(size.width / Math.max(1, size.height))
  let best = options[0]
  for (const option of options) {
    if (
      Math.abs(Math.log(option.width / option.height) - ratio) <
      Math.abs(Math.log(best.width / best.height) - ratio)
    ) {
      best = option
    }
  }
  return best?.sizeType ?? "SD3_1024_1024"
}
