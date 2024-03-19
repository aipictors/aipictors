import { GenerationConfigState } from "@/app/[lang]/generation/_machines/models/generation-config-state"
import { config } from "@/config"
import { produce } from "immer"

type Props = {
  maxTasksCount: number
  availableLoraModelsCount: number
}

/**
 * 画像生成の状態を作成する
 */
export class GenerationConfigAction {
  constructor(
    private state: GenerationConfigState,
    private props: Props,
  ) {}

  getState() {
    return this.state
  }

  /**
   * 設定をリセットする
   * @returns
   */
  reset() {
    return new GenerationConfigAction(
      new GenerationConfigState({
        ...this.state,
        promptText: config.generationFeature.defaultPromptValue,
        negativePromptText: config.generationFeature.defaultNegativePromptValue,
        modelId: config.generationFeature.defaultImageModelId,
        modelIds: config.generationFeature.defaultImageModelIds,
        modelType: config.generationFeature.defaultImageModelType,
        sampler: config.generationFeature.defaultSamplerValue,
        scale: config.generationFeature.defaultScaleValue,
        seed: -1,
        steps: config.generationFeature.defaultStepsValue,
        vae: config.generationFeature.defaultVaeValue,
        clipSkip: config.generationFeature.defaultClipSkipValue,
        i2iImageBase64: config.generationFeature.defaultI2iImageBase64,
        i2iDenoisingStrengthSize:
          config.generationFeature.defaultI2iDenoisingStrengthSize,
      }),
      this.props,
    )
  }

  /**
   * プロンプトを変更する
   * @param text
   * @returns
   */
  updatePrompt(text: string) {
    return new GenerationConfigAction(
      new GenerationConfigState({ ...this.state, promptText: text }),
      this.props,
    )
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   * @returns
   */
  updateNegativePrompt(text: string) {
    return new GenerationConfigAction(
      new GenerationConfigState({
        ...this.state,
        negativePromptText: text.trim() === "" ? "" : text,
      }),
      this.props,
    )
  }

  /**
   * サンプラを変更する
   * @param text
   * @returns
   */
  updateSampler(text: string) {
    const state = new GenerationConfigState({
      ...this.state,
      sampler: text,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * ステップ数を変更する
   * @param value
   * @returns
   */
  updateSteps(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      steps: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * スケールを変更する
   * @param value
   * @returns
   */
  updateScale(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      scale: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * サイズを変更する
   * @param text
   * @returns
   */
  updateSizeType(text: string) {
    const state = new GenerationConfigState({
      ...this.state,
      sizeType: text,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * VAEを変更する
   * @param text
   * @returns
   */
  updateVae(text: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      vae: text,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * ClipSkipを変更する
   * @param text
   * @returns
   */
  updateClipSkip(clipSkip: number) {
    const state = new GenerationConfigState({
      ...this.state,
      clipSkip: clipSkip,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * シード値を変更する
   * @param value
   * @returns
   */
  updateSeed(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      seed: value,
    })
    return new GenerationConfigAction(state, this.props)
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
      const state = new GenerationConfigState({
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
      return new GenerationConfigAction(state, this.props)
    }
    const state = new GenerationConfigState({
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
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * モデルIDを変更する
   * @param id
   * @returns
   */
  updateModelIdAndPrompt(id: string, modelType: string, promptText: string) {
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
      const state = new GenerationConfigState({
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
        promptText: promptText,
      })
      return new GenerationConfigAction(state, this.props)
    }
    const state = new GenerationConfigState({
      ...this.state,
      modelId: id,
      modelIds: modelIds,
      modelType: modelType,
      vae: this.getModelVae(modelType),
      negativePromptText: this.getNegativePromptText(
        modelType,
        this.state.negativePromptText,
      ),
      promptText: promptText,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * モデル推奨のプロンプトを使用するかどうかを変更する
   * @param text
   * @returns
   */
  updateUseRecommendedPrompt(isUseRecommendedPrompt: boolean) {
    const state = new GenerationConfigState({
      ...this.state,
      isUseRecommendedPrompt: isUseRecommendedPrompt,
    })
    return new GenerationConfigAction(state, this.props)
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
    const loraModelTexts = this.getPromptLoraModelNames().map((model) => {
      if (model.includes(name)) {
        return `<lora:${name}:${value}>`
      }
      return `<lora:${model}>`
    })

    const promptText = [this.promptTextWithoutLora, ...loraModelTexts]
      .join(" ")
      .trim()

    const state = new GenerationConfigState({ ...this.state, promptText })

    return new GenerationConfigAction(state, this.props)
  }

  /**
   * お気に入りモデルID一覧を変更する
   * @param value
   * @returns
   */
  updateFavoriteModelIds(value: number[]) {
    const state = new GenerationConfigState({
      ...this.state,
      favoriteModelIds: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * プレビュー表示するタスクを更新する
   */
  updatePreviewTask(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      previewTaskId: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * 表示するタスクを更新する
   */
  updateViewTaskId(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      viewTaskId: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * 表示元のタスク一覧を更新する
   */
  updateViewTaskIds(value: string[]) {
    const state = new GenerationConfigState({
      ...this.state,
      viewTaskIds: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * プロンプト表示モードのサムネイルサイズ
   * @param value
   * @returns
   */
  updateThumbnailSizeInPromptView(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      thumbnailSizeInPromptView: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * プロンプト表示モードのサムネイルサイズ
   * @param value
   * @returns
   */
  updateThumbnailSizeInHistoryListFull(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      thumbnailSizeInHistoryListFull: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * プロンプトの入力内容を最適化する
   * @returns
   */
  initPromptWithLoraModelValue() {
    const limitedLoraModels = this.getPromptLoraModelNames().slice(
      0,
      this.props.availableLoraModelsCount,
    )
    const loraModelTexts = limitedLoraModels.map((model) => {
      const [name, value] = model.split(":")
      const numericValue = Number.parseFloat(value)

      // valueが数値でない、または-1から1の範囲外の場合は0に設定
      const adjustedValue =
        Number.isNaN(numericValue) || numericValue < -1 || numericValue > 1
          ? 1
          : numericValue

      return `<lora:${name}:${adjustedValue}>`
    })
    const promptText = [this.promptTextWithoutLora, ...loraModelTexts]
      .join(" ")
      .trim()

    return new GenerationConfigAction(
      new GenerationConfigState({ ...this.state, promptText }),
      this.props,
    )
  }

  /**
   * モデル推奨のプロンプトを使用するかどうかを変更する
   * @param value
   * @returns
   */
  changeUseRecommendedPrompt(value: boolean) {
    const isUseRecommendedPrompt = value
    return new GenerationConfigAction(
      new GenerationConfigState({ ...this.state, isUseRecommendedPrompt }),
      this.props,
    )
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
    const loraModelNames = this.getPromptLoraModelNames().map((text) => {
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
    const state = new GenerationConfigState({
      ...this.state,
      modelType: modelType,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * i2i用の画像を変更する
   * @param modelType SD1など
   * @returns
   */
  changeI2iImageBase64(i2iImageBase64: string) {
    const state = new GenerationConfigState({
      ...this.state,
      i2iImageBase64: i2iImageBase64,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * タスク一覧の表示サムネイル種別（原画像もしくは軽量化画像）を変更する
   * @param type
   * @returns
   */
  changeTaskListThumbnailType(type: string) {
    const state = new GenerationConfigState({
      ...this.state,
      taskListThumbnailType: type,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * 待ち人数
   * @param value
   * @returns
   */
  updateImageGenerationWaitCount(value: number) {
    const state = new GenerationConfigState({
      ...this.state,
      imageGenerationWaitCount: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * 生成中かどうか
   * @param value
   * @returns
   */
  updateIsCreatingTask(value: boolean) {
    const state = new GenerationConfigState({
      ...this.state,
      isCreatingTask: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * i2i用のDenoisingStrengthSizeを変更する
   * @param modelType SD1など
   * @returns
   */
  changeI2iDenoisingStrengthSize(i2iDenoisingStrengthSize: number) {
    const state = new GenerationConfigState({
      ...this.state,
      i2iDenoisingStrengthSize: i2iDenoisingStrengthSize,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * LoRAモデルを追加する
   * @param name
   * @returns
   */
  addLoraModel(name: string) {
    // 選択可能な数を超えている場合
    if (
      this.props.availableLoraModelsCount <=
      this.getPromptLoraModelNames().length
    ) {
      return this
    }

    const loraModels = [
      ...this.getPromptLoraModelNames().map((text) => `<lora:${text}>`),
      `<lora:${name}:1>`,
    ]

    const promptText = [this.promptTextWithoutLora, ...loraModels]
      .join(" ")
      .trim()

    return new GenerationConfigAction(
      new GenerationConfigState({ ...this.state, promptText }),
      this.props,
    )
  }

  /**
   * LoRAの設定を削除する
   * @param name
   * @returns
   */
  removeLoraModel(name: string) {
    const loraModels = this.getPromptLoraModelNames().filter((model) => {
      return !model.includes(name)
    })

    const promptText = [
      this.promptTextWithoutLora,
      ...loraModels.map((text) => `<lora:${text}>`),
    ]
      .join(" ")
      .trim()

    return new GenerationConfigAction(
      new GenerationConfigState({ ...this.state, promptText }),
      this.props,
    )
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
    if (modelType === "SD1") {
      if (sizeType === "SD2_768_768" || sizeType === "SD3_1024_1024") {
        return "SD1_512_512"
      }
      if (
        sizeType === "SD2_768_1200" ||
        sizeType === "SD1_384_960" ||
        sizeType === "SD3_832_1216" ||
        sizeType === "SD3_640_1536"
      ) {
        return "SD1_512_768"
      }
      if (
        sizeType === "SD2_1200_768" ||
        sizeType === "SD1_960_384" ||
        sizeType === "SD3_1216_832" ||
        sizeType === "SD3_1536_640"
      ) {
        return "SD1_768_512"
      }
    }

    if (modelType === "SD2") {
      if (sizeType === "SD1_512_512" || sizeType === "SD3_1024_1024") {
        return "SD2_768_768"
      }
      if (
        sizeType === "SD1_512_768" ||
        sizeType === "SD3_832_1216" ||
        sizeType === "SD3_640_1536"
      ) {
        return "SD2_768_1200"
      }
      if (
        sizeType === "SD1_768_512" ||
        sizeType === "SD3_1216_832" ||
        sizeType === "SD3_1536_640"
      ) {
        return "SD2_1200_768"
      }
    }

    if (modelType === "SDXL") {
      if (sizeType === "SD1_512_512" || sizeType === "SD2_768_768") {
        return "SD3_1024_1024"
      }
      if (
        sizeType === "SD1_512_768" ||
        sizeType === "SD2_768_1200" ||
        sizeType === "SD1_384_960"
      ) {
        return "SD3_832_1216"
      }
      if (
        sizeType === "SD1_768_512" ||
        sizeType === "SD2_1200_768" ||
        sizeType === "SD1_960_384"
      ) {
        return "SD3_1216_832"
      }
    }

    if (modelType === "SD1") {
      return "SD1_512_512"
    }

    if (modelType === "SD2") {
      return "SD2_768_768"
    }

    return "SD3_1024_1024"
  }

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

  getPromptLoraModelNames() {
    const regex = /<lora:[^>]+>/g
    const regExpMatchArray = this.state.promptText.match(regex)
    if (regExpMatchArray === null) {
      return []
    }
    return Array.from(regExpMatchArray).map((text) => {
      return text.replace(/<lora:|>/g, "")
    })
  }
}
