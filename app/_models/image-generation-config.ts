import { zLoraModelConfig } from "@/app/_models/validations/lora-model-config"
import { z } from "zod"

const zProps = z.object({
  passType: z.string().nullable(),
  modelId: z.string(),
  loraConfigs: z.array(zLoraModelConfig),
  promptText: z.string(),
  negativePromptText: z.string(),
  sampler: z.string(),
  steps: z.number(),
  scale: z.number(),
  sizeType: z.string(),
  vae: z.string().nullable(),
  seed: z.number(),
  modelType: z.string(),
})

type Props = z.infer<typeof zProps>

export class ImageGenerationConfig implements Props {
  readonly passType!: Props["passType"]

  readonly modelId!: Props["modelId"]

  readonly loraConfigs!: Props["loraConfigs"]

  readonly promptText!: Props["promptText"]

  readonly negativePromptText!: Props["negativePromptText"]

  readonly sampler!: Props["sampler"]

  readonly steps!: Props["steps"]

  readonly scale!: Props["scale"]

  readonly sizeType!: Props["sizeType"]

  readonly vae!: Props["vae"]

  readonly seed!: Props["seed"]

  readonly modelType!: Props["modelType"]

  readonly isDisabled: boolean

  readonly loraModelNames: string[]

  /**
   * 利用できるLoraModelの数
   */
  readonly availableLoraModelsCount: number

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = this.promptText.length === 0
    this.loraModelNames = this.loraConfigs.map((x) => x.name)
    this.availableLoraModelsCount = 2
    if (this.passType === "LITE") {
      this.availableLoraModelsCount = 2
    }
    if (this.passType === "STANDARD") {
      this.availableLoraModelsCount = 5
    }
    if (this.passType === "PREMIUM") {
      this.availableLoraModelsCount = 5
    }
  }
}
