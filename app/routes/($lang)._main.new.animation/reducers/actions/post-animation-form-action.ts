import {
  boolean,
  literal,
  nullable,
  number,
  object,
  string,
  union,
  type InferInput,
} from "valibot"

export type PostAnimationFormAction = InferInput<
  typeof vPostAnimationFormAction
>

export const vFile = object({
  name: string(),
  size: number(),
  type: string(),
  lastModified: number(),
})

export const vPostAnimationFormAction = union([
  object({
    type: literal("SET_ANIMATION_FILE"),
    payload: nullable(vFile),
  }),
  object({
    type: literal("SET_THUMBNAIL_BASE64"),
    payload: nullable(string()),
  }),
  object({
    type: literal("SET_OGP_BASE64"),
    payload: nullable(string()),
  }),
  object({
    type: literal("SET_THUMBNAIL_POS_X"),
    payload: number(),
  }),
  object({
    type: literal("SET_THUMBNAIL_POS_Y"),
    payload: number(),
  }),
  object({
    type: literal("SET_IS_THUMBNAIL_LANDSCAPE"),
    payload: boolean(),
  }),
  object({
    type: literal("SET_UPLOADED_WORK_ID"),
    payload: string(),
  }),
  object({
    type: literal("SET_UPLOADED_WORK_UUID"),
    payload: nullable(string()),
  }),
  object({
    type: literal("SET_PROGRESS"),
    payload: number(),
  }),
  object({
    type: literal("MARK_AS_DONE"),
    payload: object({
      uploadedWorkId: string(),
      uploadedWorkUuid: nullable(string()),
    }),
  }),
  object({
    type: literal("INITIALIZE"),
    payload: object({
      thumbnailBase64: string(),
      videoFile: nullable(vFile),
      ogpBase64: string(),
      thumbnailPosX: number(),
      thumbnailPosY: number(),
      isThumbnailLandscape: boolean(),
      progress: number(),
      uploadedWorkId: string(),
      uploadedWorkUuid: nullable(string()),
    }),
  }),
])
