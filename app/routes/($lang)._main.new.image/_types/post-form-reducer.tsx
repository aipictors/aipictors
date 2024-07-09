import {
  object,
  string,
  boolean,
  date,
  array,
  number,
  nullable,
  type InferInput,
} from "valibot"

/** 生成画像の生成情報 */
const imageParameters = object({
  prompt: string(),
  negativePrompt: string(),
  seed: string(),
  steps: string(),
  strength: string(),
  noise: string(),
  scale: string(),
  sampler: string(),
  vae: string(),
  modelHash: string(),
  model: string(),
})

/** Fileオブジェクト */
const file = object({
  name: string(),
  lastModified: number(),
  size: number(),
  type: string(),
  webkitRelativePath: string(),
})

/** 投稿アイテム */
const inputPostItem = object({
  id: number(),
  content: string(),
  isContentEdited: boolean(),
})

/** フォームの状態 */
const vState = object({
  state: nullable(boolean()),
  pngInfo: nullable(
    object({
      params: imageParameters,
      src: string(),
    }),
  ),
  date: date(),
  hasNoTheme: boolean(),
  isSensitiveWhiteTags: boolean(),
  isDrawing: boolean(),
  isHovered: boolean(),
  title: string(),
  enTitle: string(),
  caption: string(),
  enCaption: string(),
  themeId: string(),
  editTargetImageBase64: string(),
  albumId: string(),
  link: string(),
  tags: array(
    object({
      id: string(),
      text: string(),
    }),
  ),
  isTagEditable: boolean(),
  isCommentsEditable: boolean(),
  isAd: boolean(),
  ratingRestriction: string(),
  accessType: string(),
  imageStyle: string(),
  aiUsed: string(),
  reservationDate: string(),
  reservationTime: string(),
  isSetGenerationParams: boolean(),
  items: array(inputPostItem),
  indexList: array(number()),
  videoFile: nullable(file),
  thumbnailBase64: string(),
  ogpBase64: string(),
  thumbnailPosX: number(),
  thumbnailPosY: number(),
  isThumbnailLandscape: boolean(),
  isCreatedWork: boolean(),
  isCreatingWork: boolean(),
  uploadedWorkId: string(),
  uploadedWorkUuid: string(),
  progress: number(),
  selectedImageGenerationIds: array(string()),
  isOpenImageGenerationDialog: boolean(),
})

/** Valibotから推論された型 */
type State = InferInput<typeof vState>

/** 初期状態 */
export const initialState: State = {
  state: null,
  pngInfo: null,
  date: new Date(),
  hasNoTheme: false,
  isSensitiveWhiteTags: false,
  isDrawing: false,
  isHovered: false,
  title: "",
  enTitle: "",
  caption: "",
  enCaption: "",
  themeId: "",
  editTargetImageBase64: "",
  albumId: "",
  link: "",
  tags: [],
  isTagEditable: false,
  isCommentsEditable: false,
  isAd: false,
  ratingRestriction: "G",
  accessType: "PUBLIC",
  imageStyle: "ILLUSTRATION",
  aiUsed: "1",
  reservationDate: "",
  reservationTime: "",
  isSetGenerationParams: true,
  items: [],
  indexList: [],
  videoFile: null,
  thumbnailBase64: "",
  ogpBase64: "",
  thumbnailPosX: 0,
  thumbnailPosY: 0,
  isThumbnailLandscape: false,
  isCreatedWork: false,
  isCreatingWork: false,
  uploadedWorkId: "",
  uploadedWorkUuid: "",
  progress: 0,
  selectedImageGenerationIds: [],
  isOpenImageGenerationDialog: false,
}
