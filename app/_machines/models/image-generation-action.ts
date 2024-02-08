import { ImageGenerationConfig } from "@/app/_models/image-generation-config"
import { produce } from "immer"

export class ImageGenerationAction {
  constructor(private state: ImageGenerationConfig) {}

  /**
   * プロンプトを変更する
   * @param text
   * @returns
   */
  updatePrompt(text: string) {
    return new ImageGenerationConfig({ ...this.state, promptText: text })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   * @returns
   */
  updateNegativePrompt(text: string) {
    return new ImageGenerationConfig({
      ...this.state,
      negativePromptText: text,
    })
  }

  /**
   * サンプラを変更する
   * @param text
   * @returns
   */
  updateSampler(text: string) {
    return new ImageGenerationConfig({
      ...this.state,
      sampler: text,
    })
  }

  /**
   * ステップ数を変更する
   * @param value
   * @returns
   */
  updateSteps(value: number) {
    return new ImageGenerationConfig({
      ...this.state,
      steps: value,
    })
  }

  /**
   * スケールを変更する
   * @param value
   * @returns
   */
  updateScale(value: number) {
    return new ImageGenerationConfig({
      ...this.state,
      scale: value,
    })
  }

  /**
   * サイズを変更する
   * @param text
   * @returns
   */
  updateSizeType(text: string) {
    return new ImageGenerationConfig({
      ...this.state,
      sizeType: text,
    })
  }

  /**
   * VAEを変更する
   * @param text
   * @returns
   */
  updateVae(text: string | null) {
    return new ImageGenerationConfig({
      ...this.state,
      vae: text,
    })
  }

  /**
   * シード値を変更する
   * @param value
   * @returns
   */
  updateSeed(value: number) {
    return new ImageGenerationConfig({
      ...this.state,
      seed: value,
    })
  }

  /**
   * モデルIDを変更する
   * @param id
   * @returns
   */
  updateModelId(id: string) {
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
   * @param name
   * @param modelValue
   */
  updateLoraModel(name: string, modelValue: number) {
    const draftConfigs = this.state.loraConfigs.map((config) => {
      if (config.name === name) {
        return { name: name, value: modelValue }
      }
      return config
    })

    const selectedModels = this.state.loraModelNames.map((name) => {
      const model = this.state.loraConfigs.find((model) => model.name === name)
      if (model === undefined) {
        throw new Error()
      }
      return model
    })

    for (const model of selectedModels) {
      if (model.name === name) {
        model.value = modelValue
      }
    }
    const promptText = this.getGenerateLoraPrompts(selectedModels)

    return new ImageGenerationConfig({
      ...this.state,
      loraConfigs: draftConfigs,
      promptText: promptText,
    })
  }

  /**
   * LoRAモデルを追加する
   * @param name
   * @param isAdded
   * @returns
   */
  addLoraModel(name: string, isAdded: boolean) {
    /**
     * 選択されたLoRAモデル
     */
    const selectedModels = this.state.loraModelNames.map((name) => {
      const model = this.state.loraConfigs.find((model) => model.name === name)
      if (model === undefined) {
        throw new Error()
      }
      return model
    })

    // 選択可能な数を超えている場合
    if (this.state.availableLoraModelsCount < selectedModels.length) {
      return this.state
    }

    const loraModelNames = produce(
      this.state.loraModelNames,
      (loraModelNames) => {
        const index = loraModelNames.indexOf(name)
        if (index === -1) {
          loraModelNames.push(name)
        } else {
          loraModelNames.splice(index, 1)
        }
      },
    )

    const loraConfigs = loraModelNames.map((name) => {
      const model = selectedModels.find((model) => model.name === name)
      if (model !== undefined) {
        return { name: model.name, value: 0 }
      }
      return { name: name, value: 0 }
    })

    if (isAdded) {
      selectedModels.push({ name: name, value: 0 })
      const promptText = this.getGenerateLoraPrompts(selectedModels)
      return new ImageGenerationConfig({
        ...this.state,
        loraConfigs: loraConfigs,
        promptText: promptText,
      })
    }

    const models = selectedModels.filter((lora) => lora.name !== name)
    const promptText = this.getGenerateLoraPrompts(models)
    return new ImageGenerationConfig({
      ...this.state,
      loraConfigs: loraConfigs,
      promptText: promptText,
    })
  }

  getGenerateLoraPrompts(models: Array<{ name: string; value: number }>) {
    const regex = /<lora:[^>]*>/g
    const cleanText = this.state.promptText.replace(regex, "").trim()

    const loraString = models
      .map((config) => `<lora:${config.name}:${config.value}>`)
      .join(" ")
    return `${cleanText} ${loraString}`.trim()
  }
}
