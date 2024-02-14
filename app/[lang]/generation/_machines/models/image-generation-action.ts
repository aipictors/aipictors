import { ImageGenerationConfig } from "@/app/_models/image-generation-config"
import { produce } from "immer"

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

  /**
   * モデルIDを変更する
   * @param id
   * @returns
   */
  updateModelId(id: string, modelType: string) {
    const modelIds = produce(this.state.modelIds, (draft) => {
      const index = draft.findIndex((modelId) => {
        return this.state.modelId === modelId
      })
      if (index === -1) return
      if (!draft.includes(id)) {
        draft[index] = id
      }
    })

    if (this.state.modelType !== modelType) {
      // 現在の選択中のモデルと違う場合はサイズ、VAEを自動変更させる
      return new ImageGenerationConfig({
        ...this.state,
        sizeType: this.getModelSizeType(this.state.sizeType, modelType),
        vae: this.getModelVae(modelType),
        modelId: id,
        modelIds: modelIds,
        modelType: modelType,
        negativePromptText: this.getNegativePromptText(
          modelType,
          this.state.negativePromptText,
        ),
      })
    }
    return new ImageGenerationConfig({
      ...this.state,
      modelId: id,
      modelIds: modelIds,
      modelType: modelType,
      vae: this.getModelVae(modelType),
      negativePromptText: this.getNegativePromptText(
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
   * プロンプトの入力内容を最適化する
   * @returns
   */
  initPromptWithLoraModelValue() {
    const limitedLoraModels = this.state.loraModels.slice(
      0,
      this.state.availableLoraModelsCount,
    )
    const loraModelTexts = limitedLoraModels.map((model) => {
      const [name, value] = model.split(":")
      const numericValue = parseFloat(value)

      // valueが数値でない、または-1から1の範囲外の場合は0に設定
      const adjustedValue =
        Number.isNaN(numericValue) || numericValue < -1 || numericValue > 1
          ? 0
          : numericValue

      return `<lora:${name}:${adjustedValue}>`
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

  /**
   * モデルの種類を変更する
   * @param modelType SD1など
   * @returns
   */
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

  /**
   * ネガティブプロンプトを取得する
   * @param modelType モデルの種類
   * @param negativePromptText ネガティブプロンプト
   * @returns
   */
  getNegativePromptText(modelType: string, negativePromptText: string) {
    const isDefaultPrompt =
      negativePromptText === "" ||
      negativePromptText === "EasyNegative" ||
      negativePromptText === "Mayng" ||
      negativePromptText === "negativeXL_D"

    if (isDefaultPrompt && modelType === "SD1") {
      return "EasyNegative"
    }

    if (isDefaultPrompt && modelType === "SD2") {
      return "Mayng"
    }

    if (isDefaultPrompt && modelType === "SDXL") {
      return "negativeXL_D"
    }

    return "EasyNegative"
  }

  /**
   * モデルに応じたサイズを取得する
   * @param sizeType サイズ
   * @param modelType モデルの種類
   * @returns
   */
  getModelSizeType(sizeType: string, modelType: string) {
    const rules = [
      ["SD1", "SD2_768_768", "SD1_512_512"],
      ["SD1", "SD3_1024_1024", "SD1_512_512"],
      ["SD1", "SD2_768_1200", "SD1_512_768"],
      ["SD1", "SD1_384_960", "SD1_512_768"],
      ["SD1", "SD3_832_1216", "SD1_512_768"],
      ["SD1", "SD3_640_1536", "SD1_512_768"],
      ["SD1", "SD2_1200_768", "SD1_768_512"],
      ["SD1", "SD1_960_384", "SD1_768_512"],
      ["SD1", "SD3_1216_832", "SD1_768_512"],
      ["SD1", "SD3_1536_640", "SD1_768_512"],
      ["SD2", "SD1_512_512", "SD2_768_768"],
      ["SD2", "SD3_1024_1024", "SD2_768_768"],
      ["SD2", "SD1_512_768", "SD2_768_1200"],
      ["SD2", "SD3_832_1216", "SD2_768_1200"],
      ["SD2", "SD3_640_1536", "SD2_768_1200"],
      ["SD2", "SD1_768_512", "SD2_1200_768"],
      ["SD2", "SD3_1216_832", "SD2_1200_768"],
      ["SD2", "SD3_1536_640", "SD2_1200_768"],
      ["SDXL", "SD1_512_512", "SD3_1024_1024"],
      ["SDXL", "SD2_768_768", "SD3_1024_1024"],
      ["SDXL", "SD1_512_768", "SD3_832_1216"],
      ["SDXL", "SD2_768_1200", "SD3_832_1216"],
      ["SDXL", "SD1_384_960", "SD3_832_1216"],
      ["SDXL", "SD1_768_512", "SD3_1216_832"],
      ["SDXL", "SD2_1200_768", "SD3_1216_832"],
      ["SDXL", "SD1_960_384", "SD3_1216_832"],
    ]

    for (const rule of rules) {
      if (rule[0] === modelType && rule[1] === sizeType) {
        return rule[2]
      }
    }

    return `${modelType}_512_512` // デフォルトの戻り値
  }

  /**
   * VAEを取得する
   * @param modelType SD1など
   * @returns
   */
  getModelVae(modelType: string) {
    if (modelType === "SD1") {
      return "ClearVAE_V2.3"
    }
    if (modelType === "SD2") {
      return "kl-f8-anime2"
    }
    if (modelType === "SDXL") {
      return "sdxl_vae"
    }
    return "ClearVAE_V2.3"
  }
}
