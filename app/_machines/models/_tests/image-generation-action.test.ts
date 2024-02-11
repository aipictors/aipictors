import { ImageGenerationAction } from "@/app/_machines/models/image-generation-action"
import { ImageGenerationConfig } from "@/app/_models/image-generation-config"

describe("ImageGenerationAction", () => {
  const config = new ImageGenerationConfig({
    passType: null,
    loraConfigs: [],
    modelId: "",
    promptText: "",
    negativePromptText: "",
    sampler: "",
    scale: 0,
    seed: -1,
    sizeType: "SD1_256_256",
    modelType: "SD1",
    steps: 0,
    vae: "",
  })

  describe("updatePrompt", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New prompt text"
      const updatedConfig = imageGenerationAction.updatePrompt(text)
      expect(updatedConfig.promptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateNegativePrompt", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the negative prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New negative prompt text"
      const updatedConfig = imageGenerationAction.updateNegativePrompt(text)
      expect(updatedConfig.negativePromptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateSampler", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the sampler text and return a new ImageGenerationConfig instance", () => {
      const text = "New sampler text"
      const updatedConfig = imageGenerationAction.updateSampler(text)
      expect(updatedConfig.sampler).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateSteps", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the steps value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSteps(value)
      expect(updatedConfig.steps).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateScale", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the scale value and return a new ImageGenerationConfig instance", () => {
      const value = 1
      const updatedConfig = imageGenerationAction.updateScale(value)
      expect(updatedConfig.scale).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateSizeType", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the size type and return a new ImageGenerationConfig instance", () => {
      const text = "New size type"
      const updatedConfig = imageGenerationAction.updateSizeType(text)
      expect(updatedConfig.sizeType).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateVae", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the vae text and return a new ImageGenerationConfig instance", () => {
      const text = "New vae text"
      const updatedConfig = imageGenerationAction.updateVae(text)
      expect(updatedConfig.vae).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateSeed", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the seed value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSeed(value)
      expect(updatedConfig.seed).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })

  describe("updateModelId", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the model id and return a new ImageGenerationConfig instance", () => {
      const id = "1"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD1")
      expect(updatedConfig.modelId).toBe(id)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })

    test("should update the size type to SD2_768_768 when the model id is 22, 23, or 24 and the current size type includes SD1", () => {
      const id = "22"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD2")
      expect(updatedConfig.sizeType).toBe("SD1_512_512")
      expect(updatedConfig).toBeInstanceOf(ImageGenerationConfig)
    })
  })
})
