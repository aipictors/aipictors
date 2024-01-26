import { toLoraPromptText } from "@/app/[lang]/(beta)/generation/_utils/to-lora-prompt-text"
import { zLoraModelConfig } from "@/app/_models/validations/lora-model-config"
import { z } from "zod"

type LoraModelConfig = z.infer<typeof zLoraModelConfig>

type LoraModel = {
  id: string
  name: string
}

export const toLoraPromptTexts = (
  loraModels: LoraModel[],
  configs: LoraModelConfig[],
) => {
  return configs.map((config) => {
    const model = loraModels.find((model) => {
      return model.id === config.modelId
    })
    if (model === undefined) return null
    return toLoraPromptText(model.name, config.value)
  })
}
