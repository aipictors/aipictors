import { describe, expect, test } from "bun:test"
import { toGenerationImageInformation } from "./to-generation-image-information"

const result = {
  prompt: "cat",
  negativePrompt: "dog",
  seed: 123,
  steps: 20,
  scale: 7,
  sampler: "euler",
  vae: "vae",
  modelHash: "abc",
  model: { name: "ChromaXL" },
}

describe("toGenerationImageInformation", () => {
  test("PNG に情報がなくても生成履歴の内容を使う", () => {
    const info = toGenerationImageInformation(result, null)
    expect(info.src).toBeNull()
    expect(info.params.prompt).toBe("cat")
    expect(info.params.negativePrompt).toBe("dog")
    expect(info.params.seed).toBe("123")
    expect(info.params.steps).toBe("20")
    expect(info.params.scale).toBe("7")
    expect(info.params.sampler).toBe("euler")
    expect(info.params.model).toBe("ChromaXL")
  })

  test("PNG で読めた項目を優先し、プロンプトは生成履歴のものにする", () => {
    const info = toGenerationImageInformation(result, {
      src: "parameters",
      params: {
        prompt: "from png",
        negativePrompt: null,
        seed: "999",
        steps: null,
        strength: "0.5",
        noise: null,
        scale: null,
        sampler: null,
        vae: null,
        modelHash: null,
        model: null,
      },
    })
    expect(info.src).toBe("parameters")
    expect(info.params.prompt).toBe("cat")
    expect(info.params.seed).toBe("999")
    expect(info.params.strength).toBe("0.5")
    expect(info.params.steps).toBe("20")
  })
})
