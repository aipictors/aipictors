import { ImageGenerationSizeType } from "@/__generated__/apollo"

export type GenerationSize = {
  width: number
  height: number
}

export const parseGenerationSize = (
  size: ImageGenerationSizeType,
): GenerationSize => {
  const parts = size.split("_")
  const width = parseInt(parts[1], 10)
  const height = parseInt(parts[2], 10)
  return { width, height } // オブジェクトとして返す
}
