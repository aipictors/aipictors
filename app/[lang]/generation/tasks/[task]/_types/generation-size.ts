export type GenerationSize = {
  width: number
  height: number
}

export const parseGenerationSize = (
  size: string, // 例："SD1_512_512"
): GenerationSize => {
  const parts = size.split("_")
  const width = Number.parseInt(parts[1], 10)
  const height = Number.parseInt(parts[2], 10)
  return { width, height }
}
