import { z } from "zod"

const zProps = z.object({
  passType: z.string().nullable(),
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
  userNanoId: z.string().nullable(),
  hasSignedTerms: z.boolean(),
})

type Props = z.infer<typeof zProps>

export class ImageGenerationState implements Props {
  readonly passType!: Props["passType"]

  readonly modelId!: Props["modelId"]

  readonly modelIds!: Props["modelIds"]

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

  readonly userNanoId!: string | null

  readonly hasSignedTerms!: boolean

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = this.promptText.length === 0
    this.availableLoraModelsCount = this.getAvailableLoraModelsCount()
    this.loraModels = this.getLoraModels()
  }

  getAvailableLoraModelsCount() {
    if (this.passType === "LITE") {
      return 2
    }
    if (this.passType === "STANDARD") {
      return 5
    }
    if (this.passType === "PREMIUM") {
      return 5
    }
    return 2
  }

  /**
   * LoRAの設定
   * @return ['flat2:0', 'hairdetailer:0.15']
   */
  getLoraModels() {
    const promptText = this.promptText
    const regex = /<lora:[^>]+>/g
    const regExpMatchArray = promptText.match(regex)
    if (regExpMatchArray === null) {
      return []
    }
    return Array.from(regExpMatchArray).map((text) => {
      return text.replace(/<lora:|>/g, "")
    })
  }
}
