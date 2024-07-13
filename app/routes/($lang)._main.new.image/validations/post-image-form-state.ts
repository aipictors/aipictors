import { vImageParameters } from "@/routes/($lang)._main.new.image/validations/image-parameters"
import {
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  string,
} from "valibot"

/**
 * Fileオブジェクト
 */
const vFile = object({
  name: nullable(string()),
  lastModified: number(),
  size: number(),
  type: nullable(string()),
  webkitRelativePath: nullable(string()),
})

/**
 * ドラッグ可能なアイテムの型を定義
 */
const vSortableItem = object({
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

export const vPostImageFormState = object({
  pngInfo: nullable(
    object({
      params: vImageParameters,
      src: nullable(string()),
    }),
  ),
  isDrawing: boolean(),
  isHovered: boolean(),
  editTargetImageBase64: nullable(string()),
  items: array(vSortableItem),
  indexList: array(number()),
  videoFile: nullable(vFile),
  thumbnailBase64: nullable(string()),
  ogpBase64: nullable(string()),
  thumbnailPosX: number(),
  thumbnailPosY: number(),
  isThumbnailLandscape: boolean(),
  isCreatedWork: boolean(),
  isCreatingWork: boolean(),
  uploadedWorkId: nullable(string()),
  uploadedWorkUuid: nullable(string()),
  progress: number(),
  selectedImageGenerationIds: array(string()),
  isOpenImageGenerationDialog: boolean(),
})
