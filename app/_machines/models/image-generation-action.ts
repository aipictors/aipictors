import { ImageGenerationConfig } from "@/app/_models/image-generation-config"
import { Config } from "@/config"
import { captureException } from "@sentry/nextjs"
import { produce } from "immer"

export class ImageGenerationAction {
  constructor(private state: ImageGenerationConfig) {}

  updatePrompt(text: string) {
    localStorage.setItem("config.generation.prompt", text)
    return new ImageGenerationConfig({ ...this.state, promptText: text })
  }

  updateNegativePrompt(text: string) {
    localStorage.setItem("config.generation.negative-prompt", text)
    return new ImageGenerationConfig({
      ...this.state,
      negativePromptText: text,
    })
  }

  updateSampler(text: string) {
    localStorage.setItem("config.generation.sampler", text)
    return new ImageGenerationConfig({
      ...this.state,
      sampler: text,
    })
  }

  updateSteps(value: number) {
    localStorage.setItem("config.generation.steps", value.toString())
    return new ImageGenerationConfig({
      ...this.state,
      steps: value,
    })
  }

  updateScale(value: number) {
    localStorage.setItem("config.generation.scale", value.toString())
    return new ImageGenerationConfig({
      ...this.state,
      scale: value,
    })
  }

  updateSizeType(text: string) {
    localStorage.setItem("config.generation.sizeType", text)
    return new ImageGenerationConfig({
      ...this.state,
      sizeType: text,
    })
  }

  updateVae(text: string | null) {
    localStorage.setItem("config.generation.vae", text ?? "")
    return new ImageGenerationConfig({
      ...this.state,
      vae: text,
    })
  }

  updateSeed(value: number) {
    localStorage.setItem("config.generation.seed", value.toString())
    return new ImageGenerationConfig({
      ...this.state,
      seed: value,
    })
  }

  updateModelId(id: string) {
    localStorage.setItem("config.generation.model", id)
    const isSd2 = id === "22" || id === "23" || id === "24"
    if (isSd2 && this.state.sizeType.includes("SD1")) {
      return new ImageGenerationConfig({
        ...this.state,
        sizeType: "SD2_768_768",
      })
    }
    return new ImageGenerationConfig({
      ...this.state,
      modelId: id,
    })
  }

  /**
   * モデルの設定を変更する
   * @param modelId
   * @param modelValue
   */
  updateLoraModel(modelId: string, modelValue: number) {
    const draftConfigs = this.state.loraConfigs.map((config) => {
      if (config.modelId === modelId) {
        return { modelId: modelId, value: modelValue }
      }
      return config
    })
    return new ImageGenerationConfig({
      ...this.state,
      loraConfigs: draftConfigs,
    })
  }

  addLoraModel(modelId: string) {
    /**
     * 選択されたLoRAモデル
     */
    const selectedModels = this.state.loraModelIds.map((id) => {
      const model = this.state.loraConfigs.find((model) => model.modelId === id)
      if (model === undefined) {
        throw new Error()
      }
      return model
    })

    const availableLoraModelCount = this.state.availableLoraModelCount

    const loraModelIds = produce(this.state.loraModelIds, (loraModelIds) => {
      const index = loraModelIds.indexOf(modelId)
      if (index === -1) {
        loraModelIds.push(modelId)
      } else {
        loraModelIds.splice(index, 1)
      }
      if (availableLoraModelCount < index) {
        loraModelIds.shift()
      }
    })

    const loraModels = loraModelIds.map((modelId) => {
      const model = selectedModels.find((model) => model.modelId === modelId)
      if (model !== undefined) {
        return { modelId: model.modelId, value: 0 }
      }
      return { modelId: modelId, value: 0 }
    })

    return new ImageGenerationConfig({
      ...this.state,
      loraConfigs: loraModels,
    })
  }

  // static fallback() {
  //   return new ImageGenerationState({
  //     passType: null,
  //     loraModels: [],
  //     modelId: "",
  //     promptText: "",
  //     negativePromptText: "",
  //     sampler: "",
  //     scale: 0,
  //     seed: -1,
  //     sizeType: "",
  //     steps: 0,
  //     vae: "",
  //   })
  // }

  static restore(props: { passType: string | null }) {
    return new ImageGenerationConfig({
      passType: props.passType,
      loraConfigs: Config.defaultImageLoraModelIds.map((modelId) => {
        return { modelId, value: 0 }
      }),
      modelId: this.restoreModelId(),
      promptText: this.restorePrompt(),
      negativePromptText: this.restoreNegativePrompt(),
      sampler: this.restoreSampler(),
      scale: this.restoreScale(),
      seed: this.restoreSeed(),
      sizeType: this.restoreSizeType(),
      steps: this.restoreSteps(),
      vae: this.restoreVae(),
    })
  }

  static restoreLoraModelIds() {
    const defaultValue = Config.defaultImageLoraModelIds
    return defaultValue
  }

  static restoreModelId() {
    const defaultValue = Config.defaultImageModelId
    try {
      const value = localStorage.getItem("config.generation.model")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restorePrompt() {
    const defaultValue = ""
    try {
      const value = localStorage.getItem("config.generation.prompt")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreNegativePrompt() {
    const defaultValue = ""
    try {
      const value = localStorage.getItem("config.generation.negativePrompt")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreSampler() {
    const defaultValue = Config.generation.defaultSamplerValue
    try {
      const value = localStorage.getItem("config.generation.sampler")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreSteps() {
    const defaultValue = Config.generation.defaultStepsValue
    try {
      const value = localStorage.getItem("config.generation.steps")
      if (value === null) {
        return defaultValue
      }
      return parseInt(value)
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreScale() {
    const defaultValue = Config.generation.defaultScaleValue
    try {
      const value = localStorage.getItem("config.generation.scale")
      if (value === null) {
        return defaultValue
      }
      return parseInt(value)
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreVae() {
    const defaultValue = Config.generation.defaultVaeValue
    try {
      const value = localStorage.getItem("config.generation.vae")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  static restoreSeed() {
    const defaultValue = -1
    try {
      const value = localStorage.getItem("config.generation.seed")
      return value !== null ? Number(value) : defaultValue
    } catch (e) {
      return defaultValue
    }
  }

  static restoreSizeType() {
    return "SD1_512_768"
  }
}
