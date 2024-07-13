import {
  object,
  string,
  boolean,
  date,
  array,
  number,
  nullable,
  type InferInput,
  literal,
  union,
  optional,
} from "valibot"

const vTag = object({
  id: string(),
  text: string(),
})

/**
 * 生成画像の生成情報
 */
const vImageParameters = object({
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

/**
 * Fileオブジェクト
 */
const vFile = object({
  name: string(),
  lastModified: number(),
  size: number(),
  type: string(),
  webkitRelativePath: string(),
})

/**
 * ドラッグ可能なアイテムの型を定義
 */
export const vSortableItem = object({
  id: number(),
  /**
   * 画像のURLなど
   */
  content: string(),
  /**
   * コンテンツが編集されたかどうか
   */
  isContentEdited: optional(boolean()),
})

const vState = object({
  state: nullable(boolean()),
  pngInfo: nullable(
    object({
      params: vImageParameters,
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
  tags: array(vTag),
  isTagEditable: boolean(),
  isCommentsEditable: boolean(),
  isAd: boolean(),
  ratingRestriction: union([
    literal("G"),
    literal("R15"),
    literal("R18"),
    literal("R18G"),
  ]),
  accessType: union([
    literal("PUBLIC"),
    literal("SILENT"),
    literal("LIMITED"),
    literal("PRIVATE"),
    literal("DRAFT"),
  ]),
  imageStyle: union([
    literal("ILLUSTRATION"),
    literal("REAL"),
    literal("SEMI_REAL"),
  ]),
  aiUsed: string(),
  reservationDate: string(),
  reservationTime: string(),
  isSetGenerationParams: boolean(),
  items: array(vSortableItem),
  indexList: array(number()),
  videoFile: nullable(vFile),
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

export type PostFormState = InferInput<typeof vState>

export type Action =
  | {
      type: "SET_PNG_INFO"
      payload: PostFormState["pngInfo"]
    }
  | {
      type: "SET_DATE"
      payload: Date
    }
  | {
      type: "SET_HAS_NO_THEME"
      payload: boolean
    }
  | {
      type: "SET_IS_SENSITIVE_WHITE_TAGS"
      payload: boolean
    }
  | {
      type: "SET_IS_DRAWING"
      payload: boolean
    }
  | {
      type: "SET_IS_HOVERED"
      payload: boolean
    }
  | {
      type: "SET_TITLE"
      payload: string
    }
  | {
      type: "SET_EN_TITLE"
      payload: string
    }
  | {
      type: "SET_CAPTION"
      payload: string
    }
  | {
      type: "SET_EN_CAPTION"
      payload: string
    }
  | {
      type: "SET_THEME_ID"
      payload: string
    }
  | {
      type: "SET_EDIT_TARGET_IMAGE_BASE64"
      payload: string
    }
  | {
      type: "SET_ALBUM_ID"
      payload: string
    }
  | {
      type: "SET_LINK"
      payload: string
    }
  | {
      type: "ADD_TAG"
      payload: InferInput<typeof vTag>
    }
  | {
      type: "REMOVE_TAG"
      payload: string
    }
  | {
      type: "SET_IS_TAG_EDITABLE"
      payload: boolean
    }
  | {
      type: "SET_IS_COMMENTS_EDITABLE"
      payload: boolean
    }
  | {
      type: "SET_IS_AD"
      payload: boolean
    }
  | {
      type: "SET_RATING_RESTRICTION"
      payload: "G" | "R15" | "R18" | "R18G"
    }
  | {
      type: "SET_ACCESS_TYPE"
      payload: "PUBLIC" | "SILENT" | "LIMITED" | "PRIVATE" | "DRAFT"
    }
  | {
      type: "SET_IMAGE_STYLE"
      payload: "ILLUSTRATION" | "REAL" | "SEMI_REAL"
    }
  | {
      type: "SET_AI_USED"
      payload: string
    }
  | {
      type: "SET_RESERVATION_DATE"
      payload: string
    }
  | {
      type: "SET_RESERVATION_TIME"
      payload: string
    }
  | {
      type: "SET_IS_SET_GENERATION_PARAMS"
      payload: boolean
    }
  | {
      type: "ADD_ITEM"
      payload: InferInput<typeof vSortableItem>
    }
  | {
      type: "REMOVE_ITEM"
      payload: number
    }
  | {
      type: "ADD_INDEX"
      payload: number
    }
  | {
      type: "REMOVE_INDEX"
      payload: number
    }
  | {
      type: "SET_VIDEO_FILE"
      payload: PostFormState["videoFile"]
    }
  | {
      type: "SET_THUMBNAIL_BASE64"
      payload: string
    }
  | {
      type: "SET_OGP_BASE64"
      payload: string
    }
  | {
      type: "SET_THUMBNAIL_POS_X"
      payload: number
    }
  | {
      type: "SET_THUMBNAIL_POS_Y"
      payload: number
    }
  | {
      type: "SET_IS_THUMBNAIL_LANDSCAPE"
      payload: boolean
    }
  | {
      type: "SET_IS_CREATED_WORK"
      payload: boolean
    }
  | {
      type: "SET_IS_CREATING_WORK"
      payload: boolean
    }
  | {
      type: "SET_UPLOADED_WORK_ID"
      payload: string
    }
  | {
      type: "SET_UPLOADED_WORK_UUID"
      payload: string
    }
  | {
      type: "SET_PROGRESS"
      payload: number
    }
  | {
      type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG"
      payload: boolean
    }
  | {
      type: "SET_ITEMS"
      payload: InferInput<typeof vSortableItem>[]
    }
  | {
      type: "SET_TAGS"
      payload: InferInput<typeof vTag>[]
    }
  | {
      type: "SET_INDEX_LIST"
      payload: number[]
    }
  | {
      type: "SET_SELECTED_IMAGE_GENERATION_IDS"
      payload: string[]
    }

export const initialState: PostFormState = {
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

export const postFormReducer = (state: PostFormState, action: Action) => {
  switch (action.type) {
    case "SET_TITLE": {
      return {
        ...state,
        title: action.payload,
      }
    }
    case "SET_DATE": {
      return {
        ...state,
        date: action.payload,
      }
    }
    case "SET_PNG_INFO": {
      return {
        ...state,
        pngInfo: action.payload,
      }
    }
    case "ADD_TAG": {
      return {
        ...state,
        tags: [...state.tags, action.payload],
      }
    }
    case "REMOVE_TAG": {
      return {
        ...state,
        tags: state.tags.filter((tag) => tag.id !== action.payload),
      }
    }
    case "ADD_ITEM": {
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    }
    case "ADD_INDEX": {
      return {
        ...state,
        indexList: [...state.indexList, action.payload],
      }
    }
    case "REMOVE_INDEX": {
      return {
        ...state,
        indexList: state.indexList.filter((index) => index !== action.payload),
      }
    }
    case "SET_VIDEO_FILE": {
      return {
        ...state,
        videoFile: action.payload,
      }
    }
    case "SET_THUMBNAIL_BASE64": {
      return {
        ...state,
        thumbnailBase64: action.payload,
      }
    }
    case "SET_OGP_BASE64": {
      return {
        ...state,
        ogpBase64: action.payload,
      }
    }
    case "SET_THUMBNAIL_POS_X": {
      return {
        ...state,
        thumbnailPosX: action.payload,
      }
    }
    case "SET_THUMBNAIL_POS_Y": {
      return {
        ...state,
        thumbnailPosY: action.payload,
      }
    }
    case "SET_IS_THUMBNAIL_LANDSCAPE": {
      return {
        ...state,
        isThumbnailLandscape: action.payload,
      }
    }
    case "SET_IS_CREATED_WORK": {
      return {
        ...state,
        isCreatedWork: action.payload,
      }
    }
    case "SET_IS_CREATING_WORK": {
      return {
        ...state,
        isCreatingWork: action.payload,
      }
    }
    case "SET_UPLOADED_WORK_ID": {
      return {
        ...state,
        uploadedWorkId: action.payload,
      }
    }
    case "SET_UPLOADED_WORK_UUID": {
      return {
        ...state,
        uploadedWorkUuid: action.payload,
      }
    }
    case "SET_PROGRESS": {
      return {
        ...state,
        progress: action.payload,
      }
    }
    case "SET_IS_OPEN_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: action.payload,
      }
    }
    case "SET_HAS_NO_THEME": {
      return {
        ...state,
        hasNoTheme: action.payload,
      }
    }
    case "SET_IS_SENSITIVE_WHITE_TAGS": {
      return {
        ...state,
        isSensitiveWhiteTags: action.payload,
      }
    }
    case "SET_IS_DRAWING": {
      return {
        ...state,
        isDrawing: action.payload,
      }
    }
    case "SET_EN_TITLE": {
      return {
        ...state,
        enTitle: action.payload,
      }
    }
    case "SET_CAPTION": {
      return {
        ...state,
        caption: action.payload,
      }
    }
    case "SET_EN_CAPTION": {
      return {
        ...state,
        enCaption: action.payload,
      }
    }
    case "SET_THEME_ID": {
      return {
        ...state,
        themeId: action.payload,
      }
    }
    case "SET_EDIT_TARGET_IMAGE_BASE64": {
      return {
        ...state,
        editTargetImageBase64: action.payload,
      }
    }
    case "SET_ALBUM_ID": {
      return {
        ...state,
        albumId: action.payload,
      }
    }
    case "SET_LINK": {
      return {
        ...state,
        link: action.payload,
      }
    }
    case "SET_IS_TAG_EDITABLE": {
      return {
        ...state,
        isTagEditable: action.payload,
      }
    }
    case "SET_IS_COMMENTS_EDITABLE": {
      return {
        ...state,
        isCommentsEditable: action.payload,
      }
    }
    case "SET_IS_AD": {
      return {
        ...state,
        isAd: action.payload,
      }
    }
    case "SET_RATING_RESTRICTION": {
      return {
        ...state,
        ratingRestriction: action.payload,
      }
    }
    case "SET_ACCESS_TYPE": {
      return {
        ...state,
        accessType: action.payload,
      }
    }
    case "SET_IMAGE_STYLE": {
      return {
        ...state,
        imageStyle: action.payload,
      }
    }
    case "SET_AI_USED": {
      return {
        ...state,
        aiUsed: action.payload,
      }
    }
    case "SET_RESERVATION_DATE": {
      return {
        ...state,
        reservationDate: action.payload,
      }
    }
    case "SET_RESERVATION_TIME": {
      return {
        ...state,
        reservationTime: action.payload,
      }
    }
    case "SET_IS_SET_GENERATION_PARAMS": {
      return {
        ...state,
        isSetGenerationParams: action.payload,
      }
    }
  }

  throw new Error("Invalid action type")
}
