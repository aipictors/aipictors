import {
  type Output,
  array,
  boolean,
  number,
  object,
  string,
  nullable,
} from "valibot"

const zProps = object({
  modelId: string(),
  searchModelId: nullable(string()),
  searchModelName: nullable(string()),
  modelIds: array(string()),
  promptText: string(),
  negativePromptText: string(),
  sampler: string(),
  steps: number(),
  scale: number(),
  sizeType: string(),
  vae: nullable(string()),
  seed: number(),
  modelType: string(),
  clipSkip: number(),
  favoriteModelIds: array(number()),
  isUseRecommendedPrompt: boolean(),
  upscaleSize: nullable(number()),
  i2iImageBase64: string(),
  i2iDenoisingStrengthSize: number(),
  previewTaskId: nullable(string()),
  viewTaskId: nullable(string()),
  viewTaskIds: array(string()),
  thumbnailSizeInPromptView: number(),
  thumbnailSizeInHistoryListFull: number(),
  taskListThumbnailType: string(),
  previewImageURL: nullable(string()),
  page: nullable(number()),
  controlNetImageBase64: nullable(string()),
  controlNetMaskImageBase64: nullable(string()),
  controlNetControlMode: nullable(string()),
  controlNetEnabled: nullable(boolean()),
  controlNetGuidanceEnd: nullable(number()),
  controlNetGuidanceStart: nullable(number()),
  controlNetPixelPerfect: nullable(boolean()),
  controlNetProcessorRes: nullable(number()),
  controlNetResizeMode: nullable(string()),
  controlNetThresholdA: nullable(number()),
  controlNetThresholdB: nullable(number()),
  controlNetWeight: nullable(number()),
  controlNetModule: nullable(string()),
  controlNetModel: nullable(string()),
  controlNetSaveDetectedMap: nullable(boolean()),
  controlNetHrOption: nullable(string()),
  currentUserToken: nullable(string()),
  generationCount: number(),
})

type Props = Output<typeof zProps>

/**
 * 画像生成のエディタの状態
 */
export class GenerationConfigState implements Props {
  readonly modelId!: Props["modelId"]

  readonly searchModelId!: Props["searchModelId"]

  readonly modelIds!: Props["modelIds"]

  readonly favoriteModelIds!: Props["favoriteModelIds"]

  readonly promptText!: Props["promptText"]

  readonly negativePromptText!: Props["negativePromptText"]

  readonly sampler!: Props["sampler"]

  readonly steps!: Props["steps"]

  readonly scale!: Props["scale"]

  readonly sizeType!: Props["sizeType"]

  readonly vae!: Props["vae"]

  readonly seed!: Props["seed"]

  readonly modelType!: Props["modelType"]

  readonly clipSkip!: Props["clipSkip"]

  readonly isDisabled: boolean

  readonly isUseRecommendedPrompt!: Props["isUseRecommendedPrompt"]

  readonly upscaleSize!: Props["upscaleSize"]

  readonly i2iImageBase64!: string

  readonly i2iDenoisingStrengthSize!: Props["i2iDenoisingStrengthSize"]

  readonly previewTaskId!: Props["previewTaskId"]

  readonly viewTaskId!: Props["viewTaskId"]

  readonly viewTaskIds!: Props["viewTaskIds"]

  readonly thumbnailSizeInPromptView!: Props["thumbnailSizeInPromptView"]

  readonly thumbnailSizeInHistoryListFull!: Props["thumbnailSizeInHistoryListFull"]

  readonly taskListThumbnailType!: Props["taskListThumbnailType"]

  readonly previewImageURL!: Props["previewImageURL"]

  readonly page!: Props["page"]

  readonly controlNetImageBase64!: Props["controlNetImageBase64"]

  readonly controlNetMaskImageBase64!: Props["controlNetMaskImageBase64"]

  readonly controlNetControlMode!: Props["controlNetControlMode"]

  readonly controlNetEnabled!: Props["controlNetEnabled"]

  readonly controlNetGuidanceEnd!: Props["controlNetGuidanceEnd"]

  readonly controlNetGuidanceStart!: Props["controlNetGuidanceStart"]

  readonly controlNetPixelPerfect!: Props["controlNetPixelPerfect"]

  readonly controlNetProcessorRes!: Props["controlNetProcessorRes"]

  readonly controlNetResizeMode!: Props["controlNetResizeMode"]

  readonly controlNetThresholdA!: Props["controlNetThresholdA"]

  readonly controlNetThresholdB!: Props["controlNetThresholdB"]

  readonly controlNetWeight!: Props["controlNetWeight"]

  readonly controlNetModule!: Props["controlNetModule"]

  readonly controlNetModel!: Props["controlNetModel"]

  readonly controlNetSaveDetectedMap!: Props["controlNetSaveDetectedMap"]

  readonly controlNetHrOption!: Props["controlNetHrOption"]

  readonly searchModelName!: Props["searchModelName"]

  readonly currentUserToken!: Props["currentUserToken"]

  readonly generationCount!: Props["generationCount"]

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = false
  }
}
