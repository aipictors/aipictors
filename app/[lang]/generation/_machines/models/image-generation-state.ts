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
})

type Props = z.infer<typeof zProps>

export class ImageGenerationState implements Props {
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

  /**
   * 利用できるLoraModelの数
   */
  readonly availableLoraModelsCount: number

  readonly loraModels: string[]

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = this.promptText.length === 0
    this.availableLoraModelsCount = 0
    this.loraModels = []
    // this.availableLoraModelsCount = this.getAvailableLoraModelsCount()
    // this.loraModels = this.getLoraModels()
  }
}
