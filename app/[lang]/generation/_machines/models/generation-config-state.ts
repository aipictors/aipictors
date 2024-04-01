import { z } from "zod"

const zProps = z.object({
  modelId: z.string(),
  searchModelId: z.string().nullable(),
  modelIds: z.array(z.string()),
  promptText: z.string(),
  negativePromptText: z.string(),
  sampler: z.string(),
  steps: z.number(),
  scale: z.number(),
  sizeType: z.string(),
  vae: z.string().nullable(),
  seed: z.number(),
  modelType: z.string(),
  clipSkip: z.number(),
  favoriteModelIds: z.array(z.number()),
  isUseRecommendedPrompt: z.boolean(),
  i2iImageBase64: z.string(),
  i2iDenoisingStrengthSize: z.number(),
  previewTaskId: z.string().nullable(),
  viewTaskId: z.string().nullable(),
  viewTaskIds: z.array(z.string()),
  thumbnailSizeInPromptView: z.number(),
  thumbnailSizeInHistoryListFull: z.number(),
  taskListThumbnailType: z.string(),
  previewImageURL: z.string().nullable(),
  page: z.number().nullable(),
  controlNetImageUrl: z.string(),
  controlNetMaskImageUrl: z.string(),
  controlNetControlMode: z.string(),
  controlNetEnabled: z.boolean(),
  controlNetGuidanceEnd: z.number(),
  controlNetGuidanceStart: z.number(),
  controlNetPixelPerfect: z.boolean(),
  controlNetProcessorRes: z.number(),
  controlNetResizeMode: z.string(),
  controlNetThresholdA: z.number(),
  controlNetThresholdB: z.number(),
  controlNetWeight: z.number(),
  controlNetModule: z.string(),
  controlNetModel: z.string(),
  controlNetSaveDetectedMap: z.boolean(),
  controlNetHrOption: z.string(),
})

type Props = z.infer<typeof zProps>

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

  readonly controlNetImageUrl!: Props["controlNetImageUrl"]

  readonly controlNetMaskImageUrl!: Props["controlNetMaskImageUrl"]

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

  constructor(props: Props) {
    Object.assign(this, props)
    this.isDisabled = false
  }
}
