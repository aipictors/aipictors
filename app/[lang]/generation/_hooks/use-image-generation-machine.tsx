import { imageGenerationMachine } from "@/app/[lang]/generation/_machines/image-generation-machine"
import { ImageGenerationAction } from "@/app/[lang]/generation/_machines/models/image-generation-action"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"
import { ImageGenerationContextView } from "@/app/[lang]/generation/_machines/models/image-generation-context-view"
import { useMachine } from "@xstate/react"

type Props = {
  passType: string | null
}

export const useImageGenerationMachine = (props: Props) => {
  const cacheStorage = new ImageGenerationCache({ passType: props.passType })

  const [state, send] = useMachine(imageGenerationMachine, {
    input: cacheStorage.restore(),
  })

  const action = new ImageGenerationAction(state.context)

  const updateSettings = (
    modelId: string,
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
    cacheStorage.saveNegativePrompt(negativePromptText)
    cacheStorage.saveModelId(modelId)
    cacheStorage.saveModelType(modelType)
    cacheStorage.saveVae(vae)
    cacheStorage.saveSampler(negativePromptText)
    cacheStorage.saveScale(scale)
    cacheStorage.saveSeed(seed)
    cacheStorage.saveSizeType(sizeType)
    cacheStorage.saveClipSkip(clipSkip)

    const value = action
      .updateNegativePrompt(negativePromptText)
      .updatePrompt(promptText)
      .updateModelId(modelId, modelType)
      .updateSampler(sampler)
      .updateScale(scale)
      .updateVae(vae)
      .updateSeed(seed)
      .updateSizeType(sizeType)
      .updateClipSkip(clipSkip)
      .getState()

    send({ type: "UPDATE_CONFIG", value })
  }

  const init = () => {
    const value = action.init().getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * プロンプトを変更する
   * @param text
   */
  const updatePrompt = (text: string) => {
    cacheStorage.savePrompt(text)
    const value = action.updatePrompt(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    cacheStorage.saveNegativePrompt(text)
    const value = action.updateNegativePrompt(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    cacheStorage.saveSampler(text)
    const value = action.updateSampler(text).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    cacheStorage.saveSteps(step)
    const value = action.updateSteps(step).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    cacheStorage.saveScale(scale)
    const value = action.updateScale(scale).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サイズを変更する
   * @param sizeType
   */
  const updateSizeType = (sizeType: string) => {
    const value = action.updateSizeType(sizeType).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * VAEを変更する
   * @param vae
   */
  const updateVae = (vae: string | null) => {
    cacheStorage.saveVae(vae)
    const value = action.updateVae(vae)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * シード値を変更する
   * @param seed
   */
  const updateSeed = (seed: number) => {
    cacheStorage.saveSeed(seed)
    const value = action.updateSeed(seed).getState()
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string, modelType: string) => {
    const value = action.updateModelId(modelId, modelType).getState()
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
    const value = action.updateClipSkip(clipSkip).getState()
    cacheStorage.saveClipSkip(value.clipSkip)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルの設定を変更する
   * @param modelName
   * @param modelValue
   */
  const updateLoraModel = (modelName: string, modelValue: number) => {
    const value = action.updateLoraModelValue(modelName, modelValue).getState()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  const initPromptWithLoraModel = () => {
    const value = action.initPromptWithLoraModelValue().getState()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * LoRAモデルを追加する
   * @param modelName
   */
  const changeLoraConfig = (modelName: string) => {
    const value = action.changeLoraModel(modelName).getState()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  return {
    context: new ImageGenerationContextView(state.context),
    init,
    updateSettings,
    updateModelId,
    changeLoraModel: changeLoraConfig,
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
  }
}
