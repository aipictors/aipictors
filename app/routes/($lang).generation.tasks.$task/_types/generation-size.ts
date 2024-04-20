export type GenerationSize = {
  width: number
  height: number
}

export const parseGenerationSize = (
  size: string, // 例："SD1_512_512"
): GenerationSize => {
  const parts = size.split("_")
  const upscale = parts[0] === "SD1" ? 1.5 : 1
  const width = Number.parseInt(parts[1], 10) * upscale
  const height = Number.parseInt(parts[2], 10) * upscale
  return { width, height }
}
