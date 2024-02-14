import { ImageGenerationCache } from "@/app/[lang]/generation/_machines/models/image-generation-cache"

describe("ImageGenerationCache", () => {
  test("should return 'Mayng' for modelType 'SD2'", () => {
    const cache = new ImageGenerationCache({ passType: null })
    const modelType = "SD2"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("Mayng")
  })

  test("should return 'negativeXL_D' for modelType 'SDXL'", () => {
    const cache = new ImageGenerationCache({ passType: null })
    const modelType = "SDXL"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("negativeXL_D")
  })

  test("should return 'EasyNegative' for unknown modelType", () => {
    const cache = new ImageGenerationCache({ passType: null })
    const modelType = "Unknown"
    const result = cache.getDefaultNegativePrompt(modelType)
    expect(result).toBe("EasyNegative")
  })
})
