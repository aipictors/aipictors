import { vFile } from "~/routes/($lang)._main.new.image/validations/file"
import {
  boolean,
  type InferInput,
  nullable,
  number,
  object,
  string,
} from "valibot"

export type PostAnimationFormState = InferInput<typeof vPostAnimationFormState>

export const vPostAnimationFormState = object({
  isHovered: boolean(),
  isThumbnailLandscape: boolean(),
  ogpBase64: nullable(string()),
  progress: number(),
  thumbnailBase64: nullable(string()),
  thumbnailPosX: number(),
  thumbnailPosY: number(),
  uploadedWorkId: nullable(string()),
  uploadedWorkUuid: nullable(string()),
  videoFile: nullable(vFile),
})
