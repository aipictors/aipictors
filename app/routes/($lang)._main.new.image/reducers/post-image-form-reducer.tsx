import type { vPostImageForm } from "@/routes/($lang)._main.new.image/validations/post-image-form"
import {
  object,
  string,
  boolean,
  number,
  nullable,
  type InferInput,
  optional,
} from "valibot"

/**
 * ドラッグ可能なアイテムの型を定義
 */
export const vSortableItem = object({
  id: number(),
  /**
   * 画像のURLなど
   */
  content: nullable(string()),
  /**
   * コンテンツが編集されたかどうか
   */
  isContentEdited: optional(boolean()),
})

export type PostFormState = InferInput<typeof vPostImageForm>

export type Action =
  | {
      type: "SET_PNG_INFO"
      payload: PostFormState["pngInfo"]
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
      type: "SET_EDITED_IMAGE"
      payload: {
        base64: string
      }
    }
  | {
      type: "SET_EDIT_TARGET_IMAGE_BASE64"
      payload: string | null
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
      payload: string | null
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
      type: "SET_INDEX_LIST"
      payload: number[]
    }
  | {
      type: "SET_SELECTED_IMAGE_GENERATION_IDS"
      payload: string[]
    }

export const postFormReducer = (
  state: PostFormState,
  action: Action,
): PostFormState => {
  switch (action.type) {
    case "SET_PNG_INFO": {
      return {
        ...state,
        pngInfo: action.payload,
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
    case "SET_IS_DRAWING": {
      return {
        ...state,
        isDrawing: action.payload,
      }
    }
    case "SET_EDIT_TARGET_IMAGE_BASE64": {
      return {
        ...state,
        editTargetImageBase64: action.payload,
      }
    }
    case "SET_EDITED_IMAGE": {
      const updatedItems = state.items.map((item) =>
        item.content === state.editTargetImageBase64
          ? { ...item, content: action.payload.base64 }
          : item,
      )
      const [item] = updatedItems
      const thumbnailBase64 =
        item.content === state.editTargetImageBase64
          ? action.payload.base64
          : state.thumbnailBase64
      return {
        ...state,
        items: updatedItems,
        thumbnailBase64: thumbnailBase64,
        editTargetImageBase64: null,
        ogpBase64: null,
      }
    }
  }

  throw new Error("Invalid action type")
}
