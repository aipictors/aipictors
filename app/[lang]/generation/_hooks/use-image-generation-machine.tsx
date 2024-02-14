import { imageGenerationMachine } from "@/app/[lang]/generation/_machines/image-generation-machine"
import { ImageGenerationAction } from "@/app/[lang]/generation/_machines/models/image-generation-action"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"
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

  /**
   * プロンプトを変更する
   * @param text
   */
  const updatePrompt = (text: string) => {
    cacheStorage.savePrompt(text)
    const value = action.updatePrompt(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    cacheStorage.saveNegativePrompt(text)
    const value = action.updateNegativePrompt(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    cacheStorage.saveSampler(text)
    const value = action.updateSampler(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    cacheStorage.saveSteps(step)
    const value = action.updateSteps(step)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    cacheStorage.saveScale(scale)
    const value = action.updateScale(scale)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サイズを変更する
   * @param sizeType
   */
  const updateSizeType = (sizeType: string) => {
    const value = action.updateSizeType(sizeType)
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
    const value = action.updateSeed(seed)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string, modelType: string) => {
    const value = action.updateModelId(modelId, modelType)
    cacheStorage.saveModelId(modelId)
    cacheStorage.saveModelType(modelType)
    cacheStorage.saveModelIds(value.modelIds)
    cacheStorage.saveSizeType(value.sizeType)
    cacheStorage.saveVae(value.vae)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルの設定を変更する
   * @param modelName
   * @param modelValue
   */
  const updateLoraModel = (modelName: string, modelValue: number) => {
    const value = action.updateLoraModelValue(modelName, modelValue)
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  const initPromptWithLoraModel = () => {
    const value = action.initPromptWithLoraModelValue()
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * LoRAモデルを追加する
   * @param modelName
   */
  const changeLoraConfig = (modelName: string) => {
    const value = action.changeLoraModel(modelName)
    cacheStorage.savePrompt(value.promptText)
    send({ type: "UPDATE_CONFIG", value })
  }

  return {
    state,
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
  }
}
