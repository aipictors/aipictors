import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import { vSortableItem } from "@/routes/($lang)._main.new.image/validations/sortable-item"
import {
  array,
  boolean,
  literal,
  nullable,
  number,
  object,
  string,
  union,
  type InferInput,
} from "valibot"

export type PostImageFormAction = InferInput<typeof vPostImageFormAction>

export const vPostImageFormAction = union([
  object({
    type: literal("SET_PNG_INFO"),
    payload: nullable(vImageInformation),
  }),
  object({
    type: literal("SET_IS_DRAWING"),
    payload: boolean(),
  }),
  object({
    type: literal("SET_EDITED_IMAGE"),
    payload: object({
      base64: string(),
    }),
  }),
  object({
    type: literal("SET_EDIT_TARGET_IMAGE_BASE64"),
    payload: nullable(string()),
  }),
  object({
    type: literal("ADD_INDEX"),
    payload: number(),
  }),
  object({
    type: literal("REMOVE_INDEX"),
    payload: number(),
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
    type: literal("OPEN_IMAGE_GENERATION_DIALOG"),
    payload: boolean(),
  }),
  object({
    type: literal("SET_ITEMS"),
    payload: array(vSortableItem),
  }),
  object({
    type: literal("SET_INDEX_LIST"),
    payload: array(number()),
  }),
  object({
    type: literal("ADD_IMAGE"),
    payload: object({
      imageId: string(),
    }),
  }),
  object({
    type: literal("CLOSE_IMAGE_GENERATION_DIALOG"),
  }),
  object({
    type: literal("SUBMIT_IMAGE_GENERATION_DIALOG"),
    payload: object({
      selectedImageGenerationUrls: array(string()),
      selectedImageGenerationIds: array(string()),
    }),
  }),
  object({
    type: literal("MARK_AS_DONE"),
    payload: object({
      uploadedWorkId: string(),
      uploadedWorkUuid: nullable(string()),
    }),
  }),
])
