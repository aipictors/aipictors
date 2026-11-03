import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"

type Props = {
  config: GenerationConfigState
  passType: string | null | undefined
  generationType: "IMAGE_TO_IMAGE" | "TEXT_TO_IMAGE"
  inProgressImageGenerationTasksCount: number
  maxTasksCount: number
}

/**
 * 生成を送れない理由
 */
export type GenerationSubmitBlock = {
  log: { message: string; details?: Record<string, unknown> }
  toast: string
  /**
   * スマホでは上に出す
   */
  isTopCenterOnMobile?: boolean
}

/**
 * プランと設定の組み合わせで送れないものを、上から順に調べる
 */
export const findGenerationSubmitBlock = (
  props: Props,
): GenerationSubmitBlock | null => {
  const {
    config,
    passType,
    generationType,
    inProgressImageGenerationTasksCount,
    maxTasksCount,
  } = props

  const isStandardOrPremium = passType === "STANDARD" || passType === "PREMIUM"

  const isLiteOrStandardOrPremium =
    passType === "LITE" || passType === "STANDARD" || passType === "PREMIUM"

  const isGeminiNanoBananaModel =
    config.modelId === "gemini-2.5-flash-image" ||
    config.modelId === "gemini-3.1-flash-image-preview"

  if (isGeminiNanoBananaModel && !isLiteOrStandardOrPremium) {
    return {
      log: {
        message: "Blocked: Gemini Nano Banana requires LITE+",
        details: {
          modelId: config.modelId,
          plan: passType ?? null,
        },
      },
      toast:
        "Gemini Nano Banana はライト以上、Nano Banana 2 はスタンダード以上のプランで利用できます。",
    }
  }

  // GEMINIの場合は画像から生成をプラン関係なく利用可能
  if (
    config.i2iImageBase64 &&
    !isLiteOrStandardOrPremium &&
    config.modelType !== "GEMINI"
  ) {
    return {
      log: { message: "Blocked: IMG2IMG requires LITE+" },
      toast: "img2imgはLITE以上のプランでご利用いただけます。",
    }
  }

  if (config.generationCount > 1 && !isStandardOrPremium) {
    return {
      log: {
        message: "Blocked: multi-count requires STANDARD+",
        details: { count: config.generationCount },
      },
      toast: "STANDARD以上のプランで生成回数をまとめて指定できます。",
    }
  }

  // 生成中かつスタンダード、プレミアム以外ならサブスクに誘導
  if (inProgressImageGenerationTasksCount !== 0 && !isStandardOrPremium) {
    return {
      log: {
        message: "Blocked: concurrent generation requires STANDARD+",
        details: { inProgressImageGenerationTasksCount },
      },
      toast: "STANDARD以上のプランで複数枚同時生成可能です。",
    }
  }

  // i2iの場合は連続生成数を超過していたらエラーにする
  if (
    generationType === "IMAGE_TO_IMAGE" &&
    inProgressImageGenerationTasksCount + config.generationCount > maxTasksCount
  ) {
    return {
      log: {
        message: "Blocked: IMG2IMG concurrent limit",
        details: {
          inProgress: inProgressImageGenerationTasksCount,
          requestCount: config.generationCount,
          maxTasksCount,
        },
      },
      toast: "同時生成枚数の上限です。",
    }
  }

  if (config.generationCount > 1 && config.controlNetImageBase64 !== null) {
    return {
      log: { message: "Blocked: ControlNet with multi-count not allowed" },
      toast: "ControlNetを使用する場合は1枚ずつ生成下さい。",
    }
  }

  if (config.modelType === "FLUX" && config.controlNetImageBase64 !== null) {
    return {
      log: { message: "Blocked: FLUX with ControlNet" },
      toast: "FLUXモデルはControlNetを使用できません。",
      isTopCenterOnMobile: true,
    }
  }

  if (config.modelType === "FLUX" && config.i2iImageBase64) {
    return {
      log: { message: "Blocked: FLUX with IMG2IMG" },
      toast:
        "FLUXモデルは画像から生成を一時的に停止しています、申し訳ございません",
      isTopCenterOnMobile: true,
    }
  }

  if (config.upscaleSize === 2 && config.i2iImageBase64) {
    return {
      log: { message: "Blocked: HighRes with IMG2IMG" },
      toast:
        "高解像度とi2iの組み合わせは現在一時停止しております、申し訳ございません",
      isTopCenterOnMobile: true,
    }
  }

  if (
    config.controlNetImageBase64 !== null &&
    (config.controlNetWeight === null || config.controlNetModule === null)
  ) {
    return {
      log: { message: "Blocked: ControlNet settings incomplete" },
      toast:
        "ControlNetの画像が設定されていますが、詳細設定が完了していません。画像を消すか、設定を完了して下さい。",
    }
  }

  return null
}
