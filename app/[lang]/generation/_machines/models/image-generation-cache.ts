import { ImageGenerationConfig } from "@/app/_models/image-generation-config"
import { config } from "@/config"
import { captureException } from "@sentry/nextjs"

type Props = { passType: string | null }

/**
 * 画像生成の設定のキャッシュを管理する
 */
export class ImageGenerationCache {
  constructor(private props: Props) {}

  /**
   * 復元する
   * @returns
   */
  restore() {
    const modelType = this.restoreModelType()
    return new ImageGenerationConfig({
      passType: this.props.passType,
      modelId: this.restoreModelId(),
      modelIds: this.restoreModelIds(),
      promptText: this.restorePrompt(),
      negativePromptText: this.restoreNegativePrompt(modelType),
      sampler: this.restoreSampler(),
      scale: this.restoreScale(),
      seed: this.restoreSeed(),
      sizeType: this.restoreSizeType(),
      steps: this.restoreSteps(),
      vae: this.restoreVae(),
      modelType: this.restoreModelType(),
    })
  }

  /**
   * モデルのIDを保存する
   * @param modelId
   */
  saveModelId(modelId: string) {
    localStorage.setItem("config.generation.model", modelId)
  }

  /**
   * モデルのIDを保存する
   * @param modelId
   */
  saveModelIds(modelIds: string[]) {
    localStorage.setItem("config.generation.models", modelIds.join(","))
  }

  /**
   * モデル種別を保存する
   * @param modelId
   */
  saveModelType(modelType: string) {
    localStorage.setItem("config.generation.model.type", modelType)
  }

  /**
   * モデルのIDを復元する
   * @returns
   */
  restoreModelId() {
    const defaultValue = config.generationFeature.defaultImageModelId
    try {
      const value = localStorage.getItem("config.generation.model")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * 選択中のモデルのID（最大3つ）を復元する
   * @returns
   */
  restoreModelIds() {
    const defaultValues = config.generationFeature.defaultImageModelIds
    try {
      const value = localStorage.getItem("config.generation.models")
      if (value === null) {
        return defaultValues
      }
      return value.split(",").map((t) => t.trim())
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValues
    }
  }

  /**
   * モデル種別を復元する
   * @returns
   */
  restoreModelType() {
    const defaultValue = config.generationFeature.defaultImageModelType
    try {
      const value = localStorage.getItem("config.generation.model.type")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * プロンプトを保存する
   * @param prompt
   */
  savePrompt(prompt: string) {
    localStorage.setItem("config.generation.prompt", prompt)
  }

  /**
   * プロンプトを復元する
   * @returns
   */
  restorePrompt() {
    const defaultValue = ""
    try {
      const value = localStorage.getItem("config.generation.prompt")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * ネガティブプロンプトを保存する
   * @param negativePrompt
   */
  saveNegativePrompt(negativePrompt: string) {
    localStorage.setItem("config.generation.negativePrompt", negativePrompt)
  }

  /**
   * ネガティブプロンプトを復元する
   * @returns
   */
  restoreNegativePrompt(modelType: string) {
    const defaultValue = this.getDefaultNegativePrompt(modelType)
    try {
      const value = localStorage.getItem("config.generation.negativePrompt")
      return value || defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return this.getDefaultNegativePrompt(modelType)
    }
  }

  /**
   * サンプラーを保存する
   * @param sampler
   */
  saveSampler(sampler: string) {
    localStorage.setItem("config.generation.sampler", sampler)
  }

  /**
   * サンプラーを復元する
   * @returns
   */
  restoreSampler() {
    const defaultValue = config.generationFeature.defaultSamplerValue
    try {
      const value = localStorage.getItem("config.generation.sampler")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * ステップ数を保存する
   * @param steps
   */
  saveSteps(steps: number) {
    localStorage.setItem("config.generation.steps", steps.toString())
  }

  /**
   * ステップ数を復元する
   * @returns
   */
  restoreSteps() {
    const defaultValue = config.generationFeature.defaultStepsValue
    try {
      const value = localStorage.getItem("config.generation.steps")
      if (value === null) {
        return defaultValue
      }
      return parseInt(value)
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * スケールを保存する
   * @param scale
   */
  saveScale(scale: number) {
    localStorage.setItem("config.generation.scale", scale.toString())
  }

  /**
   * スケールを復元する
   * @returns
   */
  restoreScale() {
    const defaultValue = config.generationFeature.defaultScaleValue
    try {
      const value = localStorage.getItem("config.generation.scale")
      if (value === null) {
        return defaultValue
      }
      return parseInt(value)
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * VAEを保存する
   * @param vae
   * @returns
   */
  saveVae(vae: string | null) {
    if (vae === null) return
    localStorage.setItem("config.generation.vae", vae)
  }

  /**
   * VAEを復元する
   * @returns
   */
  restoreVae() {
    const defaultValue = config.generationFeature.defaultVaeValue
    try {
      const value = localStorage.getItem("config.generation.vae")
      return value ?? defaultValue
    } catch (error) {
      if (error instanceof Error) {
        captureException(error)
      }
      return defaultValue
    }
  }

  /**
   * シード値を保存する
   * @param seed
   */
  saveSeed(seed: number) {
    localStorage.setItem("config.generation.seed", seed.toString())
  }

  /**
   * シード値を復元する
   * @returns
   */
  restoreSeed() {
    const defaultValue = -1
    try {
      const value = localStorage.getItem("config.generation.seed")
      return value !== null ? Number(value) : defaultValue
    } catch (e) {
      return defaultValue
    }
  }

  /**
   * サイズを保存する
   * @param sizeType
   */
  saveSizeType(sizeType: string) {
    localStorage.setItem("config.generation.size-type", sizeType)
  }

  /**
   * サイズを復元する
   * @returns
   */
  restoreSizeType() {
    const defaultValue = "SD1_512_768"
    try {
      const value = localStorage.getItem("config.generation.size-type")
      return value || defaultValue
    } catch (e) {
      return defaultValue
    }
  }

  /**
   * デフォルトのネガティブプロンプトを取得する
   * @param modelType
   * @returns
   */
  getDefaultNegativePrompt(modelType: string) {
    if (modelType === "SD1") {
      return "EasyNegative"
    }
    if (modelType === "SD2") {
      return "Mayng"
    }
    if (modelType === "SDXL") {
      return "negativeXL_D"
    }
    return "EasyNegative"
  }
}
