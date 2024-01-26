import { imageGenerationMachine } from "@/app/_machines/image-generation-machine"
import { ImageGenerationAction } from "@/app/_machines/models/image-generation-action"
import { useMachine } from "@xstate/react"

type Props = {
  passType: string | null
}

export const useImageGenerationMachine = (props: Props) => {
  const [state, send] = useMachine(imageGenerationMachine, {
    input: ImageGenerationAction.restore({ passType: props.passType }),
  })

  const action = new ImageGenerationAction(state.context)

  /**
   * プロンプトを変更する
   * @param text
   */
  const updatePrompt = (text: string) => {
    localStorage.setItem("config.generation.prompt", text)
    const value = action.updatePrompt(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ネガティブプロンプトを変更する
   * @param text
   */
  const updateNegativePrompt = (text: string) => {
    localStorage.setItem("config.generation.negativePrompt", text)
    const value = action.updateNegativePrompt(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * サンプラを変更する
   * @param text
   */
  const updateSampler = (text: string) => {
    localStorage.setItem("config.generation.sampler", text)
    const value = action.updateSampler(text)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * ステップ数を変更する
   * @param step
   */
  const updateSteps = (step: number) => {
    localStorage.setItem("config.generation.steps", step.toString())
    const value = action.updateSteps(step)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * スケールを変更する
   * @param scale
   */
  const updateScale = (scale: number) => {
    localStorage.setItem("config.generation.scale", scale.toString())
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
    localStorage.setItem("config.generation.vae", vae ?? "")
    const value = action.updateVae(vae)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * シード値を変更する
   * @param seed
   */
  const updateSeed = (seed: number) => {
    localStorage.setItem("config.generation.seed", seed.toString())
    const value = action.updateSeed(seed)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * モデルを変更する
   * @param modelId
   */
  const updateModelId = (modelId: string) => {
    localStorage.setItem("config.generation.model", modelId)
    const value = action.updateModelId(modelId)
    send({ type: "UPDATE_CONFIG", value })
    const isSd2 = modelId === "22" || modelId === "23" || modelId === "24"
    if (isSd2 && state.context.sizeType.includes("SD1")) {
      updateSizeType("SD2_768_768")
    }
  }

  /**
   * モデルの設定を変更する
   * @param modelId
   * @param modelValue
   */
  const updateLoraModel = (modelId: string, modelValue: number) => {
    const value = action.updateLoraModel(modelId, modelValue)
    send({ type: "UPDATE_CONFIG", value })
  }

  /**
   * LoRAモデルを追加する
   * @param modelId
   */
  const addLoraConfig = (modelId: string) => {
    const value = action.addLoraModel(modelId)
    send({ type: "UPDATE_CONFIG", value })
  }

  return {
    state,
    updateModelId,
    addLoraConfig: addLoraConfig,
    updateLoraModel: updateLoraModel,
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
