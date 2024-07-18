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
  editTargetImageBase64: nullable(string()),
  indexList: array(number()),
  isDrawing: boolean(),
  isHovered: boolean(),
  isOpenImageGenerationDialog: boolean(),
  isThumbnailLandscape: boolean(),
  items: array(vSortableItem),
  isSelectedGenerationImage: boolean(),
  ogpBase64: nullable(string()),
  pngInfo: nullable(vImageInformation),
  progress: number(),
  selectedImageGenerationIds: array(string()),
  thumbnailBase64: nullable(string()),
  thumbnailPosX: number(),
  thumbnailPosY: number(),
  uploadedWorkId: nullable(string()),
  uploadedWorkUuid: nullable(string()),
  videoFile: nullable(vFile),
})
