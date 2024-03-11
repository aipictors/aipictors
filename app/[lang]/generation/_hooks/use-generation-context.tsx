import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { GenerationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { GenerationConfigAction } from "@/app/[lang]/generation/_machines/models/generation-config-action"
import { GenerationConfigCache } from "@/app/[lang]/generation/_machines/models/generation-config-cache"
import { config } from "@/config"
import { useContext } from "react"

export const useGenerationContext = () => {
  const dataContext = useContext(GenerationDataContext)

  const configContext = GenerationConfigContext.useSelector((state) => {
    return state.context
  })

  const { send } = GenerationConfigContext.useActorRef()

  const cacheStorage = new GenerationConfigCache()

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
  ) => {
    cacheStorage.savePrompt(promptText)
    cacheStorage.saveSteps(steps)
    cacheStorage.saveNegativePrompt(negativePromptText)
    cacheStorage.saveModelId(modelId)
    cacheStorage.saveModelType(modelType)
    cacheStorage.saveVae(vae)
    cacheStorage.saveSampler(negativePromptText)
    cacheStorage.saveScale(scale)
    cacheStorage.saveSeed(seed)
    cacheStorage.saveSizeType(sizeType)
    cacheStorage.saveClipSkip(clipSkip)

    const value = configAction
      .updatePrompt(promptText)
      .updateSteps(steps)
      .updateModelId(modelId, modelType)
      .updateSampler(sampler)
      .updateScale(scale)
      .updateVae(vae)
      .updateSeed(seed)
      .updateSizeType(sizeType)
      .updateClipSkip(clipSkip)
      .updateNegativePrompt(negativePromptText)
      .getState()

    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モードを変更する
   * @param mode
   */
  const changeMode = (mode: string) => {
    send({ type: mode })
  }

  /**
   * プロンプトを変更する
   * @param text
   */
  const updatePrompt = (text: string) => {
    cacheStorage.savePrompt(text)
    const value = configAction.updatePrompt(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    cacheStorage.saveNegativePrompt(text)
    const value = configAction.updateNegativePrompt(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    cacheStorage.saveSampler(text)
    const value = configAction.updateSampler(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    cacheStorage.saveSteps(step)
    const value = configAction.updateSteps(step).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    cacheStorage.saveScale(scale)
    const value = configAction.updateScale(scale).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サイズを変更する
   * @param sizeType
   */
  const updateSizeType = (sizeType: string) => {
    const value = configAction.updateSizeType(sizeType).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * VAEを変更する
   * @param vae
   */
  const updateVae = (vae: string | null) => {
    cacheStorage.saveVae(vae)
    const value = configAction.updateVae(vae).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * シード値を変更する
   * @param seed
   */
  const updateSeed = (seed: number) => {
    cacheStorage.saveSeed(seed)
    const value = configAction.updateSeed(seed).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string, modelType: string) => {
    const value = configAction.updateModelId(modelId, modelType).getState()
    cacheStorage.saveModelId(modelId)
    cacheStorage.saveModelType(modelType)
    cacheStorage.saveModelIds(value.modelIds)
    cacheStorage.saveSizeType(value.sizeType)
    cacheStorage.saveVae(value.vae)
    send({ type: "UPDATE_CONFIG", value })
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
    cacheStorage.saveModelId(modelId)
    cacheStorage.saveModelType(modelType)
    cacheStorage.saveModelIds(value.modelIds)
    cacheStorage.saveSizeType(value.sizeType)
    cacheStorage.saveVae(value.vae)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ClipSkipを変更する
   * @param clipSkip
   */
  const updateClipSkip = (clipSkip: number) => {
    const value = configAction.updateClipSkip(clipSkip).getState()
    cacheStorage.saveClipSkip(value.clipSkip)
    send({ type: "UPDATE_CONFIG", value })
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
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * お気に入りのモデル一覧を変更する
   * @param modelIds お気に入りモデルIDの一覧
   */
  const updateFavoriteModelIds = (modelIds: number[]) => {
    const value = configAction.updateFavoriteModelIds(modelIds).getState()
    cacheStorage.savaFavoriteModelIds(value.favoriteModelIds)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プレビュー表示の生成タスク
   * @param taskId タスクID
   */
  const updatePreviewTaskId = (taskId: string | null) => {
    const value = configAction.updatePreviewTask(taskId).getState()
    send({ type: "UPDATE_CONFIG", value })
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
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * 表示中タスク
   * @param taskId
   * @param taskIds
   */
  const updateViewTaskId = (taskId: string | null) => {
    const value = configAction.updateViewTaskId(taskId).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プロンプトの値をLoRAモデルの値を考慮したうえで初期化する
   */
  const initPromptWithLoraModel = () => {
    const value = configAction.initPromptWithLoraModelValue().getState()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルの変更時に推奨プロンプトへの切り替えを行うかどうかを変更する
   * @param isUseRecommendedPrompt
   */
  const changeUseRecommendedPrompt = (isUseRecommendedPrompt: boolean) => {
    cacheStorage.saveUseRecommendedPrompt(isUseRecommendedPrompt)
    const value = configAction
      .changeUseRecommendedPrompt(isUseRecommendedPrompt)
      .getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * i2i向けのDenoisingStrengthSizeを変更する
   * @param i2iDenoisingStrengthSize
   */
  const changeI2iDenoisingStrengthSize = (i2iDenoisingStrengthSize: number) => {
    cacheStorage.saveI2iDenoisingStrengthSize(i2iDenoisingStrengthSize)
    const value = configAction
      .changeI2iDenoisingStrengthSize(i2iDenoisingStrengthSize)
      .getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * LoRAモデルを追加する
   * @param modelName
   */
  const changeLoraConfig = (modelName: string) => {
    const value = configAction.changeLoraModel(modelName).getState()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * i2i画像を変更する
   * @param i2iImageBase64
   */
  const changeI2iImageBase64 = (i2iImageBase64: string) => {
    const value = configAction.changeI2iImageBase64(i2iImageBase64).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * データリセット
   */
  const reset = () => {
    cacheStorage.reset()
    const value = configAction.reset().getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  return {
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
      return Array.from(regExpMatchArray).map((text) => {
        return text.replace(/<lora:|>/g, "")
      })
    },
    promptCategories: dataContext.promptCategories,
    models: dataContext.models,
    loraModels: dataContext.loraModels,
    user: dataContext.user,
    currentPass: dataContext.currentPass,
    reset,
    changeMode,
    updateSettings,
    updateModelId,
    updateFavoriteModelIds,
    changeLoraModel: changeLoraConfig,
    changeI2iImageBase64,
    changeI2iDenoisingStrengthSize,
    changeUseRecommendedPrompt,
    updateLoraModel: updateLoraModel,
    initPromptWithLoraModel: initPromptWithLoraModel,
    updatePrompt,
    updateNegativePrompt,
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
  }
}
