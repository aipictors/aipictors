import { GenerationConfigAction } from "~/routes/($lang).generation._index/machines/models/generation-config-action"
import { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import { describe, expect, test } from "bun:test"

const config = new GenerationConfigState({
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
  isUseRecommendedPrompt: false,
  i2iImageBase64: "",
  i2iDenoisingStrengthSize: 0.5,
  previewTaskId: null,
  viewTaskId: null,
  viewTaskIds: [],
  thumbnailSizeInPromptView: 7,
  thumbnailSizeInHistoryListFull: 7,
  taskListThumbnailType: "light",
  page: 0,
  controlNetImageBase64: "",
  upscaleSize: 2,
  previewImageURL: "",
  searchModelId: null,
  searchModelName: null,
  controlNetControlMode: "none",
  controlNetMaskImageBase64: "",
  controlNetEnabled: false,
  controlNetGuidanceEnd: 0,
  controlNetGuidanceStart: 0,
  controlNetHrOption: null,
  controlNetModel: null,
  controlNetModule: null,
  controlNetPixelPerfect: false,
  controlNetProcessorRes: 0,
  controlNetResizeMode: "",
  controlNetSaveDetectedMap: null,
  controlNetThresholdA: 0.5,
  controlNetThresholdB: 0.5,
  controlNetWeight: 1,
  currentUserToken: "",
  generationCount: 1,
  languageUsedForPrompt: null,
})

describe("ImageGenerationAction", () => {
  describe("updatePrompt", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New prompt text"
      const updatedConfig = imageGenerationAction.updatePrompt(text)
      expect(updatedConfig.getState().promptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateNegativePrompt", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the negative prompt text and return a new ImageGenerationConfig instance", () => {
      const text = "New negative prompt text"
      const updatedConfig = imageGenerationAction.updateNegativePrompt(text)
      expect(updatedConfig.getState().negativePromptText).toBe(text)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateSampler", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the sampler text and return a new ImageGenerationConfig instance", () => {
      const text = "New sampler text"
      const updatedConfig = imageGenerationAction.updateSampler(text)
      expect(updatedConfig.getState().sampler).toBe(text)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateSteps", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the steps value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSteps(value)
      expect(updatedConfig.getState().steps).toBe(value)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateScale", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the scale value and return a new ImageGenerationConfig instance", () => {
      const value = 1
      const updatedConfig = imageGenerationAction.updateScale(value)
      expect(updatedConfig.getState().scale).toBe(value)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateSizeType", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the size type and return a new ImageGenerationConfig instance", () => {
      const text = "New size type"
      const updatedConfig = imageGenerationAction.updateSizeType(text)
      expect(updatedConfig.getState().sizeType).toBe(text)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateVae", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the vae text and return a new ImageGenerationConfig instance", () => {
      const text = "New vae text"
      const updatedConfig = imageGenerationAction.updateVae(text)
      expect(updatedConfig.getState().vae).toBe(text)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateSeed", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the seed value and return a new ImageGenerationConfig instance", () => {
      const value = 10
      const updatedConfig = imageGenerationAction.updateSeed(value)
      expect(updatedConfig.getState().seed).toBe(value)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("updateModelId", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

    test("should update the model id and return a new ImageGenerationConfig instance", () => {
      const id = "1"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD1")
      expect(updatedConfig.getState().modelId).toBe(id)
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })

    test("選んだモデルが「最近」の先頭に来て、前のモデルも残る", () => {
      const action = new GenerationConfigAction(
        { ...config, modelId: "1", modelIds: ["1", "3", "19"] },
        { maxTasksCount: 0, availableLoraModelsCount: 0 },
      )
      const first = action.updateModelId("7", "SD1")
      expect(first.getState().modelIds).toEqual(["7", "1", "3", "19"])
      const second = first.updateModelId("3", "SD1")
      expect(second.getState().modelIds).toEqual(["3", "7", "1", "19"])
    })

    test("「最近」は増え続けない", () => {
      const action = new GenerationConfigAction(
        { ...config, modelId: "1", modelIds: ["1", "2", "3", "4", "5"] },
        { maxTasksCount: 0, availableLoraModelsCount: 0 },
      )
      expect(action.updateModelId("6", "SD1").getState().modelIds).toEqual([
        "6",
        "1",
        "2",
        "3",
        "4",
      ])
    })

    test("裏で使うモデルは「最近」に入れない", () => {
      const action = new GenerationConfigAction(
        { ...config, modelId: "1", modelIds: ["1", "3"] },
        { maxTasksCount: 0, availableLoraModelsCount: 0 },
      )
      const state = action.updateModelId("9", "SD1", false).getState()
      expect(state.modelId).toBe("9")
      expect(state.modelIds).toEqual(["1", "3"])
    })

    test("モデルを変えてもプロンプトは変わらない", () => {
      const action = imageGenerationAction.updatePrompt("1girl, smile")
      for (const modelType of ["SD1", "SDXL", "FLUX", "GEMINI"]) {
        expect(action.updateModelId("1", modelType).getState().promptText).toBe(
          "1girl, smile",
        )
      }
    })

    test("should update the size type to SD2_768_768 when the model id is 22, 23, or 24 and the current size type includes SD1", () => {
      const id = "22"
      const updatedConfig = imageGenerationAction.updateModelId(id, "SD2")
      expect(updatedConfig.getState().sizeType).toBe("SD2_768_768")
      expect(updatedConfig).toBeInstanceOf(GenerationConfigAction)
    })
  })

  describe("getModelSizeType", () => {
    const imageGenerationAction = new GenerationConfigAction(config, {
      maxTasksCount: 0,
      availableLoraModelsCount: 0,
    })

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

    test("should return the correct size type for SD5 model type", () => {
      const sizeType = "SD1_512_512"
      const modelType = "SD5"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD3_1024_1024")
    })

    test("should return the correct size type for GEMINI model type", () => {
      const sizeType = "SD1_512_512"
      const modelType = "GEMINI"
      const result = imageGenerationAction.getModelSizeType(sizeType, modelType)
      expect(result).toBe("SD3_1024_1024")
    })
  })
})

describe("getNegativePromptTextFromSd", () => {
  const imageGenerationAction = new GenerationConfigAction(config, {
    maxTasksCount: 0,
    availableLoraModelsCount: 0,
  })

  test("空欄はモデルを変えても空欄のまま", () => {
    for (const modelType of ["SD1", "SD2", "SDXL", "FLUX", "GEMINI", "SD5"]) {
      expect(imageGenerationAction.getNegativePromptText(modelType, "")).toBe(
        "",
      )
    }
  })

  test("入力したネガティブプロンプトはモデルを変えてもそのまま", () => {
    expect(
      imageGenerationAction.getNegativePromptText("SDXL", "lowres, bad hands"),
    ).toBe("lowres, bad hands")
  })

  test("初期値のネガティブプロンプトだけモデルに合うものに入れ替える", () => {
    expect(
      imageGenerationAction.getNegativePromptText("SDXL", "EasyNegative"),
    ).toBe("negativeXL_D")
    expect(
      imageGenerationAction.getNegativePromptText("SD2", "negativeXL_D"),
    ).toBe("Mayng")
  })

  test("Gemini などに変えても初期値を消さない（戻したときに空にならない）", () => {
    expect(
      imageGenerationAction.getNegativePromptText("GEMINI", "EasyNegative"),
    ).toBe("EasyNegative")
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
