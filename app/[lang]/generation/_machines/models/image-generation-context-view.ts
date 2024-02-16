import { ImageGenerationState } from "@/app/[lang]/generation/_machines/models/image-generation-state"
import { config } from "@/config"

export class ImageGenerationContextView extends ImageGenerationState {
  constructor(private config: ImageGenerationState) {
    super(config)
  }

  /**
   * 生成可能な枚数
   */
  get maxTasksCount() {
    if (this.passType === "LITE") {
      return config.passFeature.imageGenerationsCount.lite
    }
    if (this.passType === "PREMIUM") {
      return config.passFeature.imageGenerationsCount.premium
    }
    if (this.passType === "STANDARD") {
      return config.passFeature.imageGenerationsCount.standard
    }
    return config.passFeature.imageGenerationsCount.free
  }
}
