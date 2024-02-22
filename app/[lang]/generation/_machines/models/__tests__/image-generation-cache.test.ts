import { describe, expect, test } from "bun:test"
import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"

describe("ImageGenerationCache", () => {
  const cache = new ImageGenerationCache({
    passType: null,
    userNanoId: null,
    hasSignedTerms: false,
  })

  test("should return 'Mayng' for modelType 'SD2'", () => {
    const modelType = "SD2"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("Mayng")
  })

  test("should return 'negativeXL_D' for modelType 'SDXL'", () => {
    const modelType = "SDXL"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("negativeXL_D")
  })

  test("should return 'EasyNegative' for unknown modelType", () => {
    const modelType = "Unknown"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("EasyNegative")
  })
})
