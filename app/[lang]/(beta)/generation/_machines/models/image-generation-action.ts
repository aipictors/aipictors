import { ImageGenerationConfig } from "@/app/_models/image-generation-config"

/**
 * 画像生成の状態を作成する
 */
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
    console.log("updateNegativePrompt", text)
    return new ImageGenerationConfig({
      ...this.state,
      negativePromptText: text.trim() === "" ? "EasyNegative" : text,
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

  getSizeTypeToNextSizeType(nowSizeType: string, nextType: string) {
    if (nextType === "SD1") {
      if (nowSizeType === "SD2_768_768" || nowSizeType === "SD3_1024_1024") {
        return "SD1_512_512"
      }
      if (
        nowSizeType === "SD2_768_1200" ||
        nowSizeType === "SD2_384_960" ||
        nowSizeType === "SD3_832_1216" ||
        nowSizeType === "SD3_640_1536"
      ) {
        return "SD1_512_768"
      }
      if (
        nowSizeType === "SD2_1200_768" ||
        nowSizeType === "SD2_960_384" ||
        nowSizeType === "SD3_1216_832" ||
        nowSizeType === "SD3_1536_640"
      ) {
        return "SD1_768_512"
      }
    }
    if (nextType === "SD2") {
      if (nowSizeType === "SD1_512_512" || nowSizeType === "SD3_1024_1024") {
        return "SD2_768_768"
      }
      if (
        nowSizeType === "SD1_512_768" ||
        nowSizeType === "SD3_832_1216" ||
        nowSizeType === "SD3_640_1536"
      ) {
        return "SD2_768_1200"
      }
      if (
        nowSizeType === "SD1_768_512" ||
        nowSizeType === "SD3_1216_832" ||
        nowSizeType === "SD3_1536_640"
      ) {
        return "SD2_1200_768"
      }
    }
    if (nextType === "SDXL") {
      if (nowSizeType === "SD1_512_512" || nowSizeType === "SD2_768_768") {
        return "SD3_1024_1024"
      }
      if (
        nowSizeType === "SD1_512_768" ||
        nowSizeType === "SD2_768_1200" ||
        nowSizeType === "SD2_384_960"
      ) {
        return "SD3_832_1216"
      }
      if (
        nowSizeType === "SD1_768_512" ||
        nowSizeType === "SD2_1200_768" ||
        nowSizeType === "SD2_960_384"
      ) {
        return "SD3_1216_832"
      }
    }

    if (nextType === "SD1") {
      return "SD1_512_512"
    }
    if (nextType === "SD2") {
      return "SD2_768_768"
    }
    return "SD3_1024_1024"
  }

  getNegativePromptTextFromSd(sdType: string, negativePromptText: string) {
    if (
      (negativePromptText === "" ||
        negativePromptText === "EasyNegative" ||
        negativePromptText === "Mayng" ||
        negativePromptText === "negativeXL_D") &&
      sdType === "SD1"
    ) {
      return "EasyNegative"
    }
    if (
      (negativePromptText === "" ||
        negativePromptText === "EasyNegative" ||
        negativePromptText === "Mayng" ||
        negativePromptText === "negativeXL_D") &&
      sdType === "SD2"
    ) {
      return "Mayng"
    }
    if (
      (negativePromptText === "" ||
        negativePromptText === "EasyNegative" ||
        negativePromptText === "Mayng" ||
        negativePromptText === "negativeXL_D") &&
      sdType === "SDXL"
    ) {
      return "negativeXL_D"
    }
    return "EasyNegative"
  }

  /**
   * モデルIDを変更する
   * @param id
   * @returns
   */
  updateModelId(id: string, modelType: string) {
    if (this.state.modelType !== modelType) {
      return new ImageGenerationConfig({
        ...this.state,
        sizeType: this.getSizeTypeToNextSizeType(
          this.state.sizeType,
          modelType,
        ),
        modelId: id,
        modelType: modelType,
        negativePromptText: this.getNegativePromptTextFromSd(
          modelType,
          this.state.negativePromptText,
        ),
      })
    }
    return new ImageGenerationConfig({
      ...this.state,
      modelId: id,
      modelType: modelType,
      negativePromptText: this.getNegativePromptTextFromSd(
        modelType,
        this.state.negativePromptText,
      ),
    })
  }

  /**
   * モデルの設定を変更する
   * @param name LoRAの名前
   * @param value LoRAの値
   */
  updateLoraModelValue(name: string, value: number) {
    /**
     * <lora:名前:値>の形式の文字列
     */
    const loraModelTexts = this.state.loraModels.map((model) => {
      if (model.includes(name)) {
        return `<lora:${name}:${value}>`
      }
      return `<lora:${model}>`
    })

    const promptText = [this.promptTextWithoutLora, ...loraModelTexts]
      .join(" ")
      .trim()

    return new ImageGenerationConfig({ ...this.state, promptText })
  }

  /**
   * LoRAモデルを変更する
   * @param name
   * @returns
   */
  changeLoraModel(name: string) {
    /**
     * LoRAのモデルの名前
     */
    const loraModelNames = this.state.loraModels.map((text) => {
      const [name] = text.split(":")
      return name
    })

    /**
     * モデルを含んでいない場合は追加、含んでいる場合は削除
     */
    const isAdded = !loraModelNames.includes(name)

    if (isAdded) {
      return this.addLoraModel(name)
    }

    return this.removeLoraModel(name)
  }

  changeModelType(modelType: string) {
    return new ImageGenerationConfig({
      ...this.state,
      modelType: modelType,
    })
  }

  /**
   * LoRAモデルを追加する
   * @param name
   * @returns
   */
  addLoraModel(name: string) {
    // 選択可能な数を超えている場合
    if (this.state.availableLoraModelsCount < this.state.loraModels.length) {
      return this.state
    }

    const loraModels = [
      ...this.state.loraModels.map((text) => `<lora:${text}>`),
      `<lora:${name}:0>`,
    ]

    const promptText = [this.promptTextWithoutLora, ...loraModels]
      .join(" ")
      .trim()

    return new ImageGenerationConfig({ ...this.state, promptText })
  }

  /**
   * LoRAの設定を削除する
   * @param name
   * @returns
   */
  removeLoraModel(name: string) {
    const loraModels = this.state.loraModels.filter((model) => {
      return !model.includes(name)
    })

    const promptText = [
      this.promptTextWithoutLora,
      ...loraModels.map((text) => `<lora:${text}>`),
    ]
      .join(" ")
      .trim()

    return new ImageGenerationConfig({ ...this.state, promptText })
  }

  /**
   * LoRAの設定を除外したプロンプト
   */
  get promptTextWithoutLora() {
    const regex = /<lora:[^>]*>/g
    return this.state.promptText.replace(regex, "").trim()
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
