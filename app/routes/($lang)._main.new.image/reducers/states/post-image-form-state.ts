import { vFile } from "@/routes/($lang)._main.new.image/validations/file"
import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import { vSortableItem } from "@/routes/($lang)._main.new.image/validations/sortable-item"
import {
  array,
  boolean,
  type InferInput,
  nullable,
  number,
  object,
  string,
} from "valibot"

export type PostImageFormState = InferInput<typeof vPostImageFormState>

export const vPostImageFormState = object({
  pngInfo: nullable(vImageInformation),
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
