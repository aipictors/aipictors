import { Config } from "@/config"
import { ImageLoraModelsQuery } from "@/graphql/__generated__/graphql"
import { useState } from "react"

type Props = {
  passType: string | null
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
}

export const useEditorConfig = (props: Props) => {
  /**
   * 選択された画像モデルのID
   */
  const [modelId, setModelId] = useState(() => {
    const defaultValue = Config.defaultImageModelId
    try {
      const value = localStorage.getItem("config.generation.model")
      return value ? value : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  /**
   * 選択されたLoRAモデルのID
   */
  const [loraModels, setLoraModels] = useState(() => {
    return Config.defaultImageLoraModelIds.map((modelId) => {
      return { modelId, value: 0 }
    })
  })

  const [promptText, setPromptText] = useState(() => {
    const defaultValue = Config.generation.defaultPromptValue
    try {
      const value = localStorage.getItem("config.generation.prompt")
      return value ? value : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [negativePromptText, setNegativePromptText] = useState(() => {
    const defaultValue = Config.generation.defaultNegativePromptValue
    try {
      const value = localStorage.getItem("config.generation.negative-prompt")
      return value ? value : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [sampler, setSampler] = useState(() => {
    const defaultValue = Config.generation.defaultSamplerValue
    try {
      const value = localStorage.getItem("config.generation.sampler")
      return value ? value : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [steps, setSteps] = useState(() => {
    const defaultValue = Config.generation.defaultStepsValue
    try {
      const value = localStorage.getItem("config.generation.steps")
      return value ? Number(value) : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [scale, setScale] = useState(() => {
    const defaultValue = Config.generation.defaultScaleValue
    try {
      const value = localStorage.getItem("config.generation.scale")
      return value ? Number(value) : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [sizeType, setSizeType] = useState("SD1_512_768")

  const [vae, setVae] = useState(() => {
    const defaultValue = Config.generation.defaultVaeValue
    try {
      const value = localStorage.getItem("config.generation.vae")
      if (value === "") {
        return null
      }
      return value ? value : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const [seed, setSeed] = useState(() => {
    const defaultValue = -1
    try {
      const value = localStorage.getItem("config.generation.seed")
      return value ? Number(value) : defaultValue
    } catch (e) {
      return defaultValue
    }
  })

  const updatePrompt = (text: string) => {
    localStorage.setItem("config.generation.prompt", text)
    setPromptText(text)
  }

  const updateNegativePrompt = (text: string) => {
    localStorage.setItem("config.generation.negative-prompt", text)
    setNegativePromptText(text)
  }

  const updateSampler = (text: string) => {
    localStorage.setItem("config.generation.sampler", text)
    setSampler(text)
  }

  const updateSteps = (value: number) => {
    localStorage.setItem("config.generation.steps", value.toString())
    setSteps(value)
  }

  const updateScale = (value: number) => {
    localStorage.setItem("config.generation.scale", value.toString())
    setScale(value)
  }

  const updateSizeType = (text: string) => {
    setSizeType(text)
  }

  const updateVae = (text: string | null) => {
    localStorage.setItem("config.generation.vae", text ?? "")
    setVae(text === "" ? null : text)
  }

  const updateSeed = (value: number) => {
    localStorage.setItem("config.generation.seed", value.toString())
    setSeed(value)
  }

  const updateModelId = (id: string) => {
    localStorage.setItem("config.generation.model", id)
    setModelId(id)
    const isSd2 = id === "22" || id === "23" || id === "24"
    if (isSd2 && sizeType.includes("SD1")) {
      updateSizeType("SD2_768_768")
    }
  }

  const isDisabled = () => {
    if (promptText.trim().length === 0) {
      return true
    }
    return false
  }

  /**
   * モデルの設定を変更する
   * @param modelId
   * @param value
   */
  const updateLoraModel = (modelId: string, value: number) => {
    const draftConfigs = loraModels.map((config) => {
      if (config.modelId === modelId) {
        return { modelId: modelId, value }
      }
      return config
    })
    setLoraModels(draftConfigs)
  }

  const addLoraModel = (modelId: string) => {
    const selectedModelIds = loraModels.map((model) => model.modelId)

    /**
     * 選択されたLoRAモデル
     */
    const selectedModels = selectedModelIds.map((id) => {
      const model = props.loraModels.find((model) => model.id === id)
      if (model === undefined) {
        throw new Error()
      }
      return model
    })
    const modelIds = loraModels.map((model) => model.modelId)
    const draftModelIds = [...modelIds]
    const index = draftModelIds.indexOf(modelId)
    if (index === -1) {
      draftModelIds.push(modelId)
    }
    if (index !== -1) {
      draftModelIds.splice(index, 1)
    }
    if (props.passType === null && draftModelIds.length > 2) {
      draftModelIds.shift()
    }
    if (props.passType === "LITE" && draftModelIds.length > 2) {
      draftModelIds.shift()
    }
    if (props.passType === "STANDARD" && draftModelIds.length > 5) {
      draftModelIds.shift()
    }
    if (props.passType === "PREMIUM" && draftModelIds.length > 5) {
      draftModelIds.shift()
    }
    const draftModels = draftModelIds.map((modelId) => {
      const model = selectedModels.find((model) => model.id === modelId)
      if (model !== undefined) {
        return { modelId: model.id, value: 0 }
      }
      return { modelId: modelId, value: 0 }
    })
    setLoraModels(draftModels)
  }

  return {
    modelId,
    loraModels: loraModels,
    promptText,
    negativePromptText,
    sampler,
    steps,
    scale,
    sizeType,
    vae,
    seed,
    updateModelId,
    addLoraModel: addLoraModel,
    updateLoraModel: updateLoraModel,
    updatePrompt,
    updateNegativePrompt,
    updateSampler,
    updateSteps,
    updateScale,
    updateSizeType,
    updateVae,
    updateSeed,
    isDisabled: isDisabled(),
  }
}
