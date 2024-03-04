import { z } from "zod"

const zProps = z.object({
  modelId: z.string(),
  modelIds: z.array(z.string()),
  promptText: z.string(),
  negativePromptText: z.string(),
  sampler: z.string(),
  steps: z.number(),
  scale: z.number(),
  sizeType: z.string(),
  vae: z.string().nullable(),
  seed: z.number(),
  modelType: z.string(),
  clipSkip: z.number(),
  favoriteModelIds: z.array(z.number()),
  isUseRecommendedPrompt: z.boolean(),
  i2iImageBase64: z.string(),
  i2iDenoisingStrengthSize: z.number(),
  previewTask: z
    .object({
      id: z.string(),
      prompt: z.string(),
      negativePrompt: z.string(),
      seed: z.number(),
      steps: z.number(),
      scale: z.number(),
      sampler: z.string(),
      clipSkip: z.number(),
      sizeType: z.string(),
      t2tImageUrl: z.string().nullable(),
      t2tMaskImageUrl: z.string().nullable(),
      t2tDenoisingStrengthSize: z.string().nullable(),
      t2tInpaintingFillSize: z.string().nullable(),
      rating: z.number().nullable(),
      completedAt: z.number().nullable(),
      status: z.string(),
      isDeleted: z.boolean(),
      count: z.number(),
      generationType: z.string(),
      vae: z.string().nullable(),
      token: z.string().nullable(),
      nanoid: z.string().nullable(),
      estimatedSeconds: z.number().nullable(),
      model: z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
      }),
    })
    .nullable(),
})

type Props = z.infer<typeof zProps>

/**
 * 画像生成のエディタの状態
 */
export class GenerationConfigState implements Props {
  readonly modelId!: Props["modelId"]

  readonly modelIds!: Props["modelIds"]

  readonly favoriteModelIds!: Props["favoriteModelIds"]

  readonly promptText!: Props["promptText"]

  readonly negativePromptText!: Props["negativePromptText"]

  readonly sampler!: Props["sampler"]

  readonly steps!: Props["steps"]

  readonly scale!: Props["scale"]

  readonly sizeType!: Props["sizeType"]

  readonly vae!: Props["vae"]

  readonly seed!: Props["seed"]

  readonly modelType!: Props["modelType"]

  readonly clipSkip!: Props["clipSkip"]

  readonly isDisabled: boolean

  readonly isUseRecommendedPrompt!: Props["isUseRecommendedPrompt"]

  readonly i2iImageBase64!: string

  readonly i2iDenoisingStrengthSize!: Props["i2iDenoisingStrengthSize"]

  readonly previewTask: Props["previewTask"]

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = false
    this.previewTask = null
  }
}
