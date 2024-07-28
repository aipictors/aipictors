import { config } from "@/config"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/contexts/generation-config-context"
import { GenerationQueryContext } from "@/routes/($lang).generation._index/contexts/generation-query-context"
import { GenerationConfigAction } from "@/routes/($lang).generation._index/machines/models/generation-config-action"
import { useContext } from "react"

export const useGenerationContext = () => {
  const dataContext = useContext(GenerationQueryContext)

  const configContext = GenerationConfigContext.useSelector((state) => {
    return state.context
  })

  const actor = GenerationConfigContext.useActorRef()

  /**
   * 生成可能な枚数
   */
  const maxTasksCount = () => {
    if (dataContext.currentPass?.type === "LITE") {
      return config.passFeature.imageGenerationsCount.lite
    }
    if (dataContext.currentPass?.type === "PREMIUM") {
      return config.passFeature.imageGenerationsCount.premium
    }
    if (dataContext.currentPass?.type === "STANDARD") {
      return config.passFeature.imageGenerationsCount.standard
    }
    return config.passFeature.imageGenerationsCount.free
  }

  const availableLoraModelsCount = () => {
    if (dataContext.currentPass?.type === "LITE") {
      return 2
    }
    if (dataContext.currentPass?.type === "STANDARD") {
      return 5
    }
    if (dataContext.currentPass?.type === "PREMIUM") {
      return 5
    }
    return 2
  }

  const configAction = new GenerationConfigAction(configContext, {
    maxTasksCount: maxTasksCount(),
    availableLoraModelsCount: availableLoraModelsCount(),
  })

  const updateSettings = (
    modelId: string,
    steps: number,
    modelType: string,
    sampler: string,
    scale: number,
    vae: string,
    promptText: string,
    negativePromptText: string,
    seed: number,
    sizeType: string,
    clipSkip: number,
    controlNetImageBase64: string | null,
    controlNetWeight: number | null,
    controlNetModule: string | null,
    controlNetModel: string | null,
  ) => {
    const value = configAction
      .updatePrompt(promptText)
      .updateSteps(steps)
      .updateModelId(modelId, modelType)
      .updateSampler(sampler)
      .updateScale(scale)
      .updateSeed(seed)
      .updateSizeType(sizeType)
      .updateClipSkip(clipSkip)
      .updateNegativePrompt(negativePromptText)
      .updateVae(vae)
      .changeControlNetImageBase64(controlNetImageBase64)
      .changeControlNetWeight(controlNetWeight)
      .changeControlNetModule(controlNetModule)
      .changeControlNetModel(controlNetModel)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モードを変更する
   * @param mode
   */
  const changeMode = (mode: string) => {
    actor.send({ type: mode })
  }

  /**
   * プロンプトを変更する
   * @param text
   */
  const updatePrompt = (text: string) => {
    const value = configAction.updatePrompt(text).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    const value = configAction.updateNegativePrompt(text).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プロンプトとネガティブプロンプトを変更する
   */
  const updatePromptAndNegativePrompt = (
    prompt: string,
    negativePrompt: string,
  ) => {
    const value = configAction
      .updatePrompt(prompt)
      .updateNegativePrompt(negativePrompt)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    const value = configAction.updateSampler(text).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    const value = configAction.updateSteps(step).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    const value = configAction.updateScale(scale).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サイズを変更する
   * @param sizeType
   */
  const updateSizeType = (sizeType: string) => {
    const value = configAction.updateSizeType(sizeType).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * VAEを変更する
   * @param vae
   */
  const updateVae = (vae: string | null) => {
    const value = configAction.updateVae(vae).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * シード値を変更する
   * @param seed
   */
  const updateSeed = (seed: number) => {
    const value = configAction.updateSeed(seed).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string, modelType: string) => {
    const value = configAction.updateModelId(modelId, modelType).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 検索用モデルを変更する
   * @param modelId
   */
  const updateSearchWorksModelIdAndName = (
    modelId: string | null,
    modelName: string | null,
  ) => {
    const value = configAction
      .updateSearchWorksModelId(modelId)
      .updateSearchWorksModelNme(modelName)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデル、プロンプトを変更する
   * @param modelId
   */
  const updateModelIdAndPrompt = (
    modelId: string,
    modelType: string,
    promptText: string,
  ) => {
    const value = configAction
      .updateModelIdAndPrompt(modelId, modelType, promptText)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ClipSkipを変更する
   * @param clipSkip
   */
  const updateClipSkip = (clipSkip: number) => {
    const value = configAction.updateClipSkip(clipSkip).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルの設定を変更する
   * @param modelName
   * @param modelValue
   */
  const updateLoraModel = (modelName: string, modelValue: number) => {
    const value = configAction
      .updateLoraModelValue(modelName, modelValue)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * お気に入りのモデル一覧を変更する
   * @param modelIds お気に入りモデルIDの一覧
   */
  const updateFavoriteModelIds = (modelIds: number[]) => {
    const value = configAction.updateFavoriteModelIds(modelIds).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プレビュー表示の生成タスク
   * @param taskId タスクID
   */
  const updatePreviewTaskId = (taskId: string | null) => {
    const value = configAction.updatePreviewTask(taskId).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プレビュー表示の画像URL
   * @param taskId タスクID
   */
  const updatePreviewImageURL = (url: string | null) => {
    const value = configAction.updatePreviewImageURL(url).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 表示中タスク
   * @param taskId
   * @param taskIds
   */
  const updateViewTask = (taskId: string | null, taskIds: string[]) => {
    const value = configAction
      .updateViewTaskIds(taskIds)
      .updateViewTaskId(taskId)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 表示中タスク
   * @param taskId
   * @param taskIds
   */
  const updateViewTaskId = (taskId: string | null) => {
    const value = configAction.updateViewTaskId(taskId).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プロンプト表示モードのサムネイルサイズを変更する
   * @param thumbnailSize
   */
  const updateThumbnailSizeInPromptView = (thumbnailSize: number) => {
    const value = configAction
      .updateThumbnailSizeInPromptView(thumbnailSize)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 生成履歴一覧モードのサムネイルサイズを変更する
   * @param thumbnailSize
   */
  const updateThumbnailSizeInHistoryListFull = (thumbnailSize: number) => {
    const value = configAction
      .updateThumbnailSizeInHistoryListFull(thumbnailSize)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プロンプトの値をLoRAモデルの値を考慮したうえで初期化する
   */
  const initPromptWithLoraModel = () => {
    const value = configAction.initPromptWithLoraModelValue().getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルの変更時に推奨プロンプトへの切り替えを行うかどうかを変更する
   * @param isUseRecommendedPrompt
   */
  const changeUseRecommendedPrompt = (isUseRecommendedPrompt: boolean) => {
    const value = configAction
      .changeUseRecommendedPrompt(isUseRecommendedPrompt)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * i2i向けのDenoisingStrengthSizeを変更する
   * @param i2iDenoisingStrengthSize
   */
  const changeI2iDenoisingStrengthSize = (i2iDenoisingStrengthSize: number) => {
    const value = configAction
      .changeI2iDenoisingStrengthSize(i2iDenoisingStrengthSize)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetImageBase64を変更する
   * @param value
   */
  const changeControlNetImageBase64 = (item: string) => {
    const value = configAction.changeControlNetImageBase64(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetMaskImageBase64を変更する
   * @param value
   */
  const changeControlNetMaskImageBase64 = (item: string) => {
    const value = configAction.changeControlNetMaskImageBase64(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetControlModeを変更する
   * @param value
   */
  const changeControlNetControlMode = (item: string) => {
    const value = configAction.changeControlNetControlMode(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetEnabledを変更する
   * @param value
   */
  const changeControlNetEnabled = (item: boolean) => {
    const value = configAction.changeControlNetEnabled(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetEnabledを変更する
   * @param value
   */
  const changeCurrentUserToken = (token: string) => {
    const value = configAction.updateCurrentUserToken(token).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetGuidanceEndを変更する
   * @param value
   */
  const changeControlNetGuidanceEnd = (item: number) => {
    const value = configAction.changeControlNetGuidanceEnd(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetGuidanceStartを変更する
   * @param value
   */
  const changeControlNetGuidanceStart = (item: number) => {
    const value = configAction.changeControlNetGuidanceStart(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetPixelPerfectを変更する
   * @param value
   */
  const changeControlNetPixelPerfect = (item: boolean) => {
    const value = configAction.changeControlNetPixelPerfect(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetProcessorResを変更する
   * @param value
   */
  const changeControlNetProcessorRes = (item: number) => {
    const value = configAction.changeControlNetProcessorRes(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetResizeModeを変更する
   * @param value
   */
  const changeControlNetResizeMode = (item: string) => {
    const value = configAction.changeControlNetResizeMode(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetThresholdAを変更する
   * @param value
   */
  const changeControlNetThresholdA = (item: number) => {
    const value = configAction.changeControlNetThresholdA(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetThresholdBを変更する
   * @param value
   */
  const changeControlNetThresholdB = (item: number) => {
    const value = configAction.changeControlNetThresholdB(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetWeightを変更する
   * @param value
   */
  const changeControlNetWeight = (item: number) => {
    const value = configAction.changeControlNetWeight(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetModuleを変更する
   * @param value
   */
  const changeControlNetModule = (item: string) => {
    const value = configAction.changeControlNetModule(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  const resetImageInputSetting = () => {
    const value = configAction
      .changeControlNetModule(null)
      .changeControlNetModel(null)
      .changeI2iImageBase64("")
      .changeControlNetImageBase64(null)
      .changeControlNetMaskImageBase64(null)
      .changeControlNetControlMode(null)
      .changeControlNetWeight(null)
      .changeGenerationCount(1)
      .changePage(0)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  const changeControlNetModuleAndModelAndWeight = (
    model: string | null,
    module: string | null,
    weight: number | null,
  ) => {
    const value = configAction
      .changeControlNetModel(model)
      .changeControlNetModule(module)
      .changeControlNetWeight(weight)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  const changeControlNetModuleAndModelAndImage = (
    model: string | null,
    module: string | null,
    image: string | null,
    mask: string | null,
    weight: number | null,
  ) => {
    const value = configAction
      .changeControlNetModel(model)
      .changeControlNetModule(module)
      .changeControlNetImageBase64(image)
      .changeControlNetMaskImageBase64(mask)
      .changeControlNetWeight(weight)
      .getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetModelを変更する
   * @param value
   */
  const changeControlNetModel = (item: string) => {
    const value = configAction.changeControlNetModel(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetSaveDetectedMapを変更する
   * @param value
   */
  const changeControlNetSaveDetectedMap = (item: boolean) => {
    const value = configAction.changeControlNetSaveDetectedMap(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * controlNetHrOptionを変更する
   * @param value
   */
  const changeControlNetHrOption = (item: string) => {
    const value = configAction.changeControlNetHrOption(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 生成回数を変更する
   * @param value
   */
  const changeGenerationCount = (item: number) => {
    const value = configAction.changeGenerationCount(item).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * LoRAモデルを追加する
   * @param modelName
   */
  const changeLoraConfig = (modelName: string) => {
    const value = configAction.changeLoraModel(modelName).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * アップスケールサイズを変更する
   * @param i2iImageBase64
   */
  const changeUpscaleSize = (size: number | null) => {
    const value = configAction.changeUpscaleSize(size).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * i2i画像を変更する
   * @param i2iImageBase64
   */
  const changeI2iImageBase64 = (i2iImageBase64: string) => {
    const value = configAction.changeI2iImageBase64(i2iImageBase64).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * タスク一覧の表示サムネイル種別（原画像もしくは軽量化画像）を変更する
   * @param
   */
  const changeTaskListThumbnailType = (type: string) => {
    const value = configAction.changeTaskListThumbnailType(type).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * タスク一覧のページ数を変更する
   * @param
   */
  const changePage = (page: number) => {
    const value = configAction.changePage(page).getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * データリセット
   */
  const reset = () => {
    const value = configAction.reset().getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 初期化向けデータリセット（画面リロード時に実行する）
   */
  const resetForInit = () => {
    const value = configAction.resetForInit().getState()
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  return {
    viewer: dataContext.viewer,
    engineStatus: dataContext.engineStatus,
    config: configContext,
    get maxTasksCount() {
      return maxTasksCount()
    },
    get availableLoraModelsCount() {
      return availableLoraModelsCount()
    },
    get promptLoraModels() {
      const regex = /<lora:[^>]+>/g
      const regExpMatchArray = configContext.promptText.match(regex)
      if (regExpMatchArray === null) {
        return []
      }
      return Array.from(regExpMatchArray).map((text: unknown) => {
        return (text as string).replace(/<lora:|>/g, "")
      }) as string[]
    },
    promptCategories: dataContext.promptCategories,
    negativePromptCategories: dataContext.negativePromptCategories,
    controlNetCategories: dataContext.controlNetCategories,
    models: dataContext.models,
    loraModels: dataContext.loraModels,
    user: dataContext.user,
    currentPass: dataContext.currentPass,
    reset,
    resetImageInputSetting,
    resetForInit,
    changeMode,
    updateSettings,
    updateModelId,
    updateFavoriteModelIds,
    changeLoraModel: changeLoraConfig,
    changeUpscaleSize,
    changeI2iImageBase64,
    changeI2iDenoisingStrengthSize,
    changeUseRecommendedPrompt,
    changeTaskListThumbnailType,
    changePage,
    changeControlNetImageBase64,
    changeControlNetMaskImageBase64,
    changeControlNetControlMode,
    changeControlNetEnabled,
    changeControlNetGuidanceEnd,
    changeControlNetGuidanceStart,
    changeControlNetPixelPerfect,
    changeControlNetProcessorRes,
    changeControlNetResizeMode,
    changeControlNetThresholdA,
    changeControlNetThresholdB,
    changeControlNetWeight,
    changeControlNetModule,
    changeControlNetModuleAndModelAndWeight,
    changeControlNetModel,
    changeControlNetSaveDetectedMap,
    changeControlNetHrOption,
    changeGenerationCount,
    changeControlNetModuleAndModelAndImage,
    changeCurrentUserToken,
    updateLoraModel: updateLoraModel,
    initPromptWithLoraModel: initPromptWithLoraModel,
    updateSearchWorksModelIdAndName: updateSearchWorksModelIdAndName,
    updatePreviewImageURL,
    updatePrompt,
    updateNegativePrompt,
    updatePromptAndNegativePrompt,
    updateSampler,
    updateSteps,
    updateScale,
    updateSizeType,
    updateVae,
    updateSeed,
    updateClipSkip,
    updateModelIdAndPrompt,
    updatePreviewTaskId: updatePreviewTaskId,
    updateViewTask: updateViewTask,
    updateViewTaskId: updateViewTaskId,
    updateThumbnailSizeInPromptView: updateThumbnailSizeInPromptView,
    updateThumbnailSizeInHistoryListFull: updateThumbnailSizeInHistoryListFull,
  }
}
