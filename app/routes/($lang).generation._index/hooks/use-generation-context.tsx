import { config } from "~/config"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { GenerationQueryContext } from "~/routes/($lang).generation._index/contexts/generation-query-context"
import { GenerationConfigAction } from "~/routes/($lang).generation._index/machines/models/generation-config-action"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import { useContext } from "react"

/**
 * 状態機械ごとの、最後に送った設定
 */
const latestConfigByActor = new WeakMap<object, GenerationConfigState>()

export function useGenerationContext () {
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

  /**
   * 設定の変更はいつも最新の設定を元にする
   * （描画時点の設定を使うと、同じタイミングの別の変更を古い値で上書きしてしまう。
   * 例: 「このモデルで生成」でモデルを選んだ直後に、初期化が元のモデルに戻していた）
   */
  const getConfigAction = () => {
    const latest = latestConfigByActor.get(actor) ?? actor.getSnapshot().context
    return new GenerationConfigAction(latest, {
      maxTasksCount: maxTasksCount(),
      availableLoraModelsCount: availableLoraModelsCount(),
    })
  }

  /**
   * 設定を送る。画面を開いた直後は状態機械がまだ動いておらず、送った設定は順番待ちになる。
   * その間に別の変更を作るときも、最後に送った設定を元にする
   */
  const sendConfig = (value: GenerationConfigState) => {
    latestConfigByActor.set(actor, value)
    actor.send({ type: "UPDATE_CONFIG", value })
  }

  const updateSettings = (
    modelId: string,
    steps: number,
    modelType: string,
    sampler: string,
    scale: number,
    vae: string | null,
    promptText: string | null,
    negativePromptText: string | null,
    seed: number,
    sizeType: string,
    clipSkip: number,
    controlNetImageBase64: string | null,
    controlNetWeight: number | null,
    controlNetModule: string | null,
    controlNetModel: string | null,
  ) => {
    const value = getConfigAction()
      .updatePrompt(promptText ?? "")
      .updateSteps(steps)
      .updateModelId(modelId, modelType)
      .updateSampler(sampler)
      .updateScale(scale)
      .updateSeed(seed)
      .updateSizeType(sizeType)
      .updateClipSkip(clipSkip)
      .updateNegativePrompt(negativePromptText ?? "")
      .updateVae(vae)
      .changeControlNetImageBase64(controlNetImageBase64)
      .changeControlNetWeight(controlNetWeight)
      .changeControlNetModule(controlNetModule)
      .changeControlNetModel(controlNetModel)
      .changeLanguageUsedForPrompt(null)
      .getState()
    sendConfig(value)
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
    const value = getConfigAction().updatePrompt(text).getState()
    sendConfig(value)
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    const value = getConfigAction().updateNegativePrompt(text).getState()
    sendConfig(value)
  }

  /**
   * プロンプトとネガティブプロンプトを変更する
   */
  const updatePromptAndNegativePrompt = (
    prompt: string,
    negativePrompt: string,
  ) => {
    const value = getConfigAction()
      .updatePrompt(prompt)
      .updateNegativePrompt(negativePrompt)
      .getState()
    sendConfig(value)
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    const value = getConfigAction().updateSampler(text).getState()
    sendConfig(value)
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    const value = getConfigAction().updateSteps(step).getState()
    sendConfig(value)
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    const value = getConfigAction().updateScale(scale).getState()
    sendConfig(value)
  }

  /**
   * サイズを変更する
   * @param sizeType
   */
  const updateSizeType = (sizeType: string) => {
    const value = getConfigAction().updateSizeType(sizeType).getState()
    sendConfig(value)
  }

  /**
   * VAEを変更する
   * @param vae
   */
  const updateVae = (vae: string | null) => {
    const value = getConfigAction().updateVae(vae).getState()
    sendConfig(value)
  }

  /**
   * シード値を変更する
   * @param seed
   */
  const updateSeed = (seed: number) => {
    const value = getConfigAction().updateSeed(seed).getState()
    sendConfig(value)
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string, modelType: string) => {
    const value = getConfigAction().updateModelId(modelId, modelType).getState()
    sendConfig(value)
  }

  /**
   * 検索用モデルを変更する
   * @param modelId
   */
  const updateSearchWorksModelIdAndName = (
    modelId: string | null,
    modelName: string | null,
  ) => {
    const value = getConfigAction()
      .updateSearchWorksModelId(modelId)
      .updateSearchWorksModelNme(modelName)
      .getState()
    sendConfig(value)
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
    const value = getConfigAction()
      .updateModelIdAndPrompt(modelId, modelType, promptText)
      .getState()
    sendConfig(value)
  }

  /**
   * ClipSkipを変更する
   * @param clipSkip
   */
  const updateClipSkip = (clipSkip: number) => {
    const value = getConfigAction().updateClipSkip(clipSkip).getState()
    sendConfig(value)
  }

  /**
   * モデルの設定を変更する
   * @param modelName
   * @param modelValue
   */
  const updateLoraModel = (modelName: string, modelValue: number) => {
    const value = getConfigAction()
      .updateLoraModelValue(modelName, modelValue)
      .getState()
    sendConfig(value)
  }

  /**
   * お気に入りのモデル一覧を変更する
   * @param modelIds お気に入りモデルIDの一覧
   */
  const updateFavoriteModelIds = (modelIds: number[]) => {
    const value = getConfigAction().updateFavoriteModelIds(modelIds).getState()
    sendConfig(value)
  }

  /**
   * プレビュー表示の生成タスク
   * @param taskId タスクID
   */
  const updatePreviewTaskId = (taskId: string | null) => {
    const value = getConfigAction().updatePreviewTask(taskId).getState()
    sendConfig(value)
  }

  /**
   * プレビュー表示の画像URL
   * @param taskId タスクID
   */
  const updatePreviewImageURL = (url: string | null) => {
    const value = getConfigAction().updatePreviewImageURL(url).getState()
    sendConfig(value)
  }

  /**
   * 表示中タスク
   * @param taskId
   * @param taskIds
   */
  const updateViewTask = (taskId: string | null, taskIds: string[]) => {
    const value = getConfigAction()
      .updateViewTaskIds(taskIds)
      .updateViewTaskId(taskId)
      .getState()
    sendConfig(value)
  }

  /**
   * 表示中タスク
   * @param taskId
   * @param taskIds
   */
  const updateViewTaskId = (taskId: string | null) => {
    const value = getConfigAction().updateViewTaskId(taskId).getState()
    sendConfig(value)
  }

  /**
   * プロンプト表示モードのサムネイルサイズを変更する
   * @param thumbnailSize
   */
  const updateThumbnailSizeInPromptView = (thumbnailSize: number) => {
    const value = getConfigAction()
      .updateThumbnailSizeInPromptView(thumbnailSize)
      .getState()
    sendConfig(value)
  }

  /**
   * 生成履歴一覧モードのサムネイルサイズを変更する
   * @param thumbnailSize
   */
  const updateThumbnailSizeInHistoryListFull = (thumbnailSize: number) => {
    const value = getConfigAction()
      .updateThumbnailSizeInHistoryListFull(thumbnailSize)
      .getState()
    sendConfig(value)
  }

  /**
   * プロンプトの値をLoRAモデルの値を考慮したうえで初期化する
   */
  const initPromptWithLoraModel = () => {
    const value = getConfigAction().initPromptWithLoraModelValue().getState()
    sendConfig(value)
  }

  /**
   * モデルの変更時に推奨プロンプトへの切り替えを行うかどうかを変更する
   * @param isUseRecommendedPrompt
   */
  const changeUseRecommendedPrompt = (isUseRecommendedPrompt: boolean) => {
    const value = getConfigAction()
      .changeUseRecommendedPrompt(isUseRecommendedPrompt)
      .getState()
    sendConfig(value)
  }

  /**
   * i2i向けのDenoisingStrengthSizeを変更する
   * @param i2iDenoisingStrengthSize
   */
  const changeI2iDenoisingStrengthSize = (i2iDenoisingStrengthSize: number) => {
    const value = getConfigAction()
      .changeI2iDenoisingStrengthSize(i2iDenoisingStrengthSize)
      .getState()
    sendConfig(value)
  }

  /**
   * controlNetImageBase64を変更する
   * @param value
   */
  const changeControlNetImageBase64 = (item: string) => {
    const value = getConfigAction().changeControlNetImageBase64(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetMaskImageBase64を変更する
   * @param value
   */
  const changeControlNetMaskImageBase64 = (item: string) => {
    const value = getConfigAction().changeControlNetMaskImageBase64(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetControlModeを変更する
   * @param value
   */
  const changeControlNetControlMode = (item: string | null) => {
    const value = getConfigAction().changeControlNetControlMode(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetEnabledを変更する
   * @param value
   */
  const changeControlNetEnabled = (item: boolean) => {
    const value = getConfigAction().changeControlNetEnabled(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetEnabledを変更する
   * @param value
   */
  const changeCurrentUserToken = (token: string) => {
    const value = getConfigAction().updateCurrentUserToken(token).getState()
    sendConfig(value)
  }

  /**
   * controlNetGuidanceEndを変更する
   * @param value
   */
  const changeControlNetGuidanceEnd = (item: number) => {
    const value = getConfigAction().changeControlNetGuidanceEnd(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetGuidanceStartを変更する
   * @param value
   */
  const changeControlNetGuidanceStart = (item: number) => {
    const value = getConfigAction().changeControlNetGuidanceStart(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetPixelPerfectを変更する
   * @param value
   */
  const changeControlNetPixelPerfect = (item: boolean) => {
    const value = getConfigAction().changeControlNetPixelPerfect(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetProcessorResを変更する
   * @param value
   */
  const changeControlNetProcessorRes = (item: number) => {
    const value = getConfigAction().changeControlNetProcessorRes(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetResizeModeを変更する
   * @param value
   */
  const changeControlNetResizeMode = (item: string) => {
    const value = getConfigAction().changeControlNetResizeMode(item).getState()
    sendConfig(value)
  }

  /**
   * 言語モードを変更する
   * @param value
   */
  const changeLanguageUsedForPrompt = (item: string | null) => {
    const value = getConfigAction().changeLanguageUsedForPrompt(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetThresholdAを変更する
   * @param value
   */
  const changeControlNetThresholdA = (item: number) => {
    const value = getConfigAction().changeControlNetThresholdA(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetThresholdBを変更する
   * @param value
   */
  const changeControlNetThresholdB = (item: number) => {
    const value = getConfigAction().changeControlNetThresholdB(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetWeightを変更する
   * @param value
   */
  const changeControlNetWeight = (item: number) => {
    const value = getConfigAction().changeControlNetWeight(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetModuleを変更する
   * @param value
   */
  const changeControlNetModule = (item: string) => {
    const value = getConfigAction().changeControlNetModule(item).getState()
    sendConfig(value)
  }

  const resetImageInputSetting = () => {
    const value = getConfigAction()
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
    sendConfig(value)
  }

  const changeControlNetModuleAndModelAndWeight = (
    model: string | null,
    module: string | null,
    weight: number | null,
  ) => {
    const value = getConfigAction()
      .changeControlNetModel(model)
      .changeControlNetModule(module)
      .changeControlNetWeight(weight)
      .getState()
    sendConfig(value)
  }

  const changeControlNetModuleAndModelAndImage = (
    model: string | null,
    module: string | null,
    image: string | null,
    mask: string | null,
    weight: number | null,
  ) => {
    const value = getConfigAction()
      .changeControlNetModel(model)
      .changeControlNetModule(module)
      .changeControlNetImageBase64(image)
      .changeControlNetMaskImageBase64(mask)
      .changeControlNetWeight(weight)
      .getState()
    sendConfig(value)
  }

  /**
   * controlNetModelを変更する
   * @param value
   */
  const changeControlNetModel = (item: string) => {
    const value = getConfigAction().changeControlNetModel(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetSaveDetectedMapを変更する
   * @param value
   */
  const changeControlNetSaveDetectedMap = (item: boolean) => {
    const value = getConfigAction().changeControlNetSaveDetectedMap(item).getState()
    sendConfig(value)
  }

  /**
   * controlNetHrOptionを変更する
   * @param value
   */
  const changeControlNetHrOption = (item: string) => {
    const value = getConfigAction().changeControlNetHrOption(item).getState()
    sendConfig(value)
  }

  /**
   * 生成回数を変更する
   * @param value
   */
  const changeGenerationCount = (item: number) => {
    const value = getConfigAction().changeGenerationCount(item).getState()
    sendConfig(value)
  }

  /**
   * LoRAモデルを追加する
   * @param modelName
   */
  const changeLoraConfig = (
    modelName: string,
    triggerWord?: string,
    weight?: number,
  ) => {
    const value = getConfigAction()
      .changeLoraModel(modelName, triggerWord, weight)
      .getState()
    sendConfig(value)
  }

  /**
   * アップスケールサイズを変更する
   * @param i2iImageBase64
   */
  const changeUpscaleSize = (size: number | null) => {
    const value = getConfigAction().changeUpscaleSize(size).getState()
    sendConfig(value)
  }

  /**
   * i2i画像を変更する
   * @param i2iImageBase64
   */
  const changeI2iImageBase64 = (i2iImageBase64: string) => {
    const value = getConfigAction().changeI2iImageBase64(i2iImageBase64).getState()
    sendConfig(value)
  }

  /**
   * タスク一覧の表示サムネイル種別（原画像もしくは軽量化画像）を変更する
   * @param
   */
  const changeTaskListThumbnailType = (type: string) => {
    const value = getConfigAction().changeTaskListThumbnailType(type).getState()
    sendConfig(value)
  }

  /**
   * タスク一覧のページ数を変更する
   * @param
   */
  const changePage = (page: number) => {
    const value = getConfigAction().changePage(page).getState()
    sendConfig(value)
  }

  /**
   * データリセット
   */
  const reset = () => {
    const value = getConfigAction().reset().getState()
    sendConfig(value)
  }

  /**
   * 初期化向けデータリセット（画面リロード時に実行する）
   */
  const resetForInit = () => {
    const value = getConfigAction().resetForInit().getState()
    sendConfig(value)
  }

  return {
    ...dataContext,
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
    changeLanguageUsedForPrompt,
  }
}
