import { config } from "@/config"
import { GenerationConfigState } from "@/routes/($lang).generation._index/_machines/models/generation-config-state"
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

  resetForInit() {
    return new GenerationConfigAction(
      new GenerationConfigState({
        ...this.state,
        i2iImageBase64: "",
        controlNetImageBase64: null,
        controlNetMaskImageBase64: null,
        controlNetControlMode: null,
        controlNetEnabled: null,
        controlNetGuidanceEnd: null,
        controlNetGuidanceStart: null,
        controlNetPixelPerfect: null,
        controlNetProcessorRes: null,
        controlNetResizeMode: null,
        controlNetThresholdA: null,
        controlNetThresholdB: null,
        controlNetWeight: null,
        controlNetModule: null,
        controlNetModel: null,
        controlNetSaveDetectedMap: null,
        controlNetHrOption: null,
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
   * 作品検索用のモデルIDを変更する
   * @param id
   * @returns
   */
  updateSearchWorksModelId(id: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      searchModelId: id,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * 作品検索時に検索中に表示するモデル名を変更する
   * @param id
   * @returns
   */
  updateSearchWorksModelNme(name: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      searchModelName: name,
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
   * プレビュー表示する画像URLを更新する
   */
  updatePreviewImageURL(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      previewImageURL: value,
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
   * @param i2iImageBase64
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
   * アップスケールサイズを変更する
   * @param i2iImageBase64
   * @returns
   */
  changeUpscaleSize(size: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      upscaleSize: size,
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
   * タスク一覧のページを変更する
   * @param page
   * @returns
   */
  changePage(page: number) {
    const state = new GenerationConfigState({
      ...this.state,
      page: page,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * i2i用のDenoisingStrengthSizeを変更する
   * @param value
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
   * controlNetImageBase64を変更する
   * @param value
   * @returns
   */
  changeControlNetImageBase64(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetImageBase64: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetMaskImageBase64を変更する
   * @param value
   * @returns
   */
  changeControlNetMaskImageBase64(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetMaskImageBase64: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetControlModeを変更する
   * @param value
   * @returns
   */
  changeControlNetControlMode(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetControlMode: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetEnabledを変更する
   * @param value
   * @returns
   */
  changeControlNetEnabled(value: boolean | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetEnabled: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetGuidanceEndを変更する
   * @param value
   * @returns
   */
  changeControlNetGuidanceEnd(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetGuidanceEnd: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetGuidanceStartを変更する
   * @param value
   * @returns
   */
  changeControlNetGuidanceStart(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetGuidanceStart: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetPixelPerfectを変更する
   * @param value
   * @returns
   */
  changeControlNetPixelPerfect(value: boolean | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetPixelPerfect: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetProcessorResを変更する
   * @param value
   * @returns
   */
  changeControlNetProcessorRes(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetProcessorRes: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetResizeModeを変更する
   * @param value
   * @returns
   */
  changeControlNetResizeMode(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetResizeMode: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetThresholdAを変更する
   * @param value
   * @returns
   */
  changeControlNetThresholdA(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetThresholdA: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetThresholdBを変更する
   * @param value
   * @returns
   */
  changeControlNetThresholdB(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetThresholdB: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetWeightを変更する
   * @param value
   * @returns
   */
  changeControlNetWeight(value: number | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetWeight: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetModuleを変更する
   * @param value
   * @returns
   */
  changeControlNetModule(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetModule: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetModelを変更する
   * @param value
   * @returns
   */
  changeControlNetModel(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetModel: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetSaveDetectedMapを変更する
   * @param value
   * @returns
   */
  changeControlNetSaveDetectedMap(value: boolean | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetSaveDetectedMap: value,
    })
    return new GenerationConfigAction(state, this.props)
  }

  /**
   * controlNetHrOptionを変更する
   * @param value
   * @returns
   */
  changeControlNetHrOption(value: string | null) {
    const state = new GenerationConfigState({
      ...this.state,
      controlNetHrOption: value,
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

    return negativePromptText
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
      return "vae-ft-mse-840000-ema-pruned"
    }
    if (modelType === "SD2") {
      return "kl-f8-anime2"
    }
    if (modelType === "SDXL") {
      return "sdxl_vae"
    }
    return "clearvae_v23"
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
