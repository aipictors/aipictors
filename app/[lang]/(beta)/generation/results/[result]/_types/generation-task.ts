import { ImageGenerationSizeType } from "@/__generated__/apollo"

export type GenerationParameters = {
  prompt: string
  negativePrompt: string
  seed: number
  steps: number
  scale: number
  sampler: string
  sizeType: ImageGenerationSizeType
  modelName: string
}
