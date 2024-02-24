import { ImageGenerationAction } from "@/app/[lang]/generation/_machines/models/image-generation-action"
import { ImageGenerationState } from "@/app/[lang]/generation/_machines/models/image-generation-state"

const config = new ImageGenerationState({
  passType: null,
  userNanoId: null,
  hasSignedTerms: false,
  modelId: "",
  modelIds: [],
  favoriteModelIds: [],
  promptText: "",
  negativePromptText: "",
  sampler: "",
  scale: 0,
  seed: -1,
  sizeType: "SD1_256_256",
  modelType: "SD1",
  steps: 0,
  vae: "",
  clipSkip: 0,
})

describe("ImageGenerationAction", () => {
  describe("updatePrompt", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New prompt text"
      const updatedConfig = imageGenerationAction.updatePrompt(text)
      expect(updatedConfig.getState().promptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateNegativePrompt", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the negative prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New negative prompt text"
      const updatedConfig = imageGenerationAction.updateNegativePrompt(text)
      expect(updatedConfig.getState().negativePromptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateSampler", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the sampler text and return a new ImageGenerationConfig instance", () => {
      const text = "New sampler text"
      const updatedConfig = imageGenerationAction.updateSampler(text)
      expect(updatedConfig.getState().sampler).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateSteps", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the steps value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSteps(value)
      expect(updatedConfig.getState().steps).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateScale", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the scale value and return a new ImageGenerationConfig instance", () => {
      const value = 1
      const updatedConfig = imageGenerationAction.updateScale(value)
      expect(updatedConfig.getState().scale).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateSizeType", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the size type and return a new ImageGenerationConfig instance", () => {
      const text = "New size type"
      const updatedConfig = imageGenerationAction.updateSizeType(text)
      expect(updatedConfig.getState().sizeType).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateVae", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the vae text and return a new ImageGenerationConfig instance", () => {
      const text = "New vae text"
      const updatedConfig = imageGenerationAction.updateVae(text)
      expect(updatedConfig.getState().vae).toBe(text)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateSeed", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the seed value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSeed(value)
      expect(updatedConfig.getState().seed).toBe(value)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("updateModelId", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should update the model id and return a new ImageGenerationConfig instance", () => {
      const id = "1"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD1")
      expect(updatedConfig.getState().modelId).toBe(id)
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })

    test("should update the size type to SD2_768_768 when the model id is 22, 23, or 24 and the current size type includes SD1", () => {
      const id = "22"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD2")
      expect(updatedConfig.getState().sizeType).toBe("SD2_768_768")
      expect(updatedConfig).toBeInstanceOf(ImageGenerationAction)
    })
  })

  describe("getModelSizeType", () => {
    const imageGenerationAction = new ImageGenerationAction(config)

    test("should return the correct size type for SD1 model type", () => {
      const sizeType = "SD2_768_768"
      const modelType = "SD1"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD1_512_512")
    })

    test("should return the correct size type for SD2 model type", () => {
      const sizeType = "SD1_512_512"
      const modelType = "SD2"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD2_768_768")
    })

    test("should return the correct size type for SDXL model type", () => {
      const sizeType = "SD2_768_768"
      const modelType = "SDXL"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD3_1024_1024")
    })

    test("should return the default size type for unknown model types", () => {
      const sizeType = "SD1_512_512"
      const modelType = "Unknown"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD3_1024_1024")
    })
  })
})

describe("getNegativePromptTextFromSd", () => {
  const imageGenerationAction = new ImageGenerationAction(config)

  test("should return 'EasyNegative' when negativePromptText is empty and sdType is 'SD1'", () => {
    const sdType = "SD1"
    const negativePromptText = ""
    const result = imageGenerationAction.getNegativePromptText(
      sdType,
      negativePromptText,
    )
    expect(result).toBe("EasyNegative")
  })

  test("should return 'Mayng' when negativePromptText is empty and sdType is 'SD2'", () => {
    const sdType = "SD2"
    const negativePromptText = ""
    const result = imageGenerationAction.getNegativePromptText(
      sdType,
      negativePromptText,
    )
    expect(result).toBe("Mayng")
  })

  test("should return 'negativeXL_D' when negativePromptText is empty and sdType is 'SDXL'", () => {
    const sdType = "SDXL"
    const negativePromptText = ""
    const result = imageGenerationAction.getNegativePromptText(
      sdType,
      negativePromptText,
    )
    expect(result).toBe("negativeXL_D")
  })

  test("should return 'EasyNegative' when negativePromptText is 'EasyNegative' and sdType is 'SD1'", () => {
    const sdType = "SD1"
    const negativePromptText = "EasyNegative"
    const result = imageGenerationAction.getNegativePromptText(
      sdType,
      negativePromptText,
    )
    expect(result).toBe("EasyNegative")
  })
})
