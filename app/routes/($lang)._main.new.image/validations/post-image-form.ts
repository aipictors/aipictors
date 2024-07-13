import { vImageParameters } from "@/routes/($lang)._main.new.image/validations/image-parameters"
import { vSortableItem } from "@/routes/($lang)._main.new.image/validations/post-image-form-input"
import { array, boolean, nullable, number, object, string } from "valibot"

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

export const vPostImageForm = object({
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
