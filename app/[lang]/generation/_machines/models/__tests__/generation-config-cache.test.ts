import { describe, expect, test } from "bun:test"
import { GenerationConfigCache } from "@/app/[lang]/generation/_machines/models/generation-config-cache"

describe("ImageGenerationCache", () => {
  const cache = new GenerationConfigCache()

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
