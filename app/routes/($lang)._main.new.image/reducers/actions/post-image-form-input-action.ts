import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import { vPostAccessType } from "@/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostRating } from "@/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "@/routes/($lang)._main.new.image/validations/post-tag"
import {
  array,
  boolean,
  instance,
  literal,
  null_,
  nullable,
  object,
  string,
  union,
  type InferInput,
} from "valibot"

export type PostImageFormInputAction = InferInput<
  typeof vPostImageFormInputAction
>

export const vPostImageFormInputAction = union([
  object({
    type: literal("SET_DATE"),
    payload: instance(Date),
  }),
  object({
    type: literal("SET_TITLE"),
    payload: string(),
  }),
  object({
    type: literal("SET_EN_TITLE"),
    payload: string(),
  }),
  object({
    type: literal("SET_CAPTION"),
    payload: string(),
  }),
  object({
    type: literal("SET_EN_CAPTION"),
    payload: string(),
  }),
  object({
    type: literal("SET_THEME_ID"),
    payload: union([
      object({
        themeId: string(),
        themeTitle: string(),
      }),
      object({
        themeId: null_(),
        themeTitle: string(),
      }),
    ]),
  }),
  object({
    type: literal("SET_ALBUM_ID"),
    payload: string(),
  }),
  object({
    type: literal("SET_LINK"),
    payload: string(),
  }),
  object({
    type: literal("ADD_TAG"),
    payload: vTag,
  }),
  object({
    type: literal("REMOVE_TAG"),
    payload: string(),
  }),
  object({
    type: literal("ENABLE_TAG_FEATURE"),
    payload: boolean(),
  }),
  object({
    type: literal("ENABLE_COMMENT_FEATURE"),
    payload: boolean(),
  }),
  object({
    type: literal("ENABLE_PROMOTION_FEATURE"),
    payload: boolean(),
  }),
  object({
    type: literal("ENABLE_GENERATION_PARAMS_FEATURE"),
    payload: boolean(),
  }),
  object({
    type: literal("SET_RATING_RESTRICTION"),
    payload: vPostRating,
  }),
  object({
    type: literal("SET_ACCESS_TYPE"),
    payload: vPostAccessType,
  }),
  object({
    type: literal("SET_IMAGE_STYLE"),
    payload: union([
      literal("ILLUSTRATION"),
      literal("REAL"),
      literal("SEMI_REAL"),
    ]),
  }),
  object({
    type: literal("SET_AI_MODEL_ID"),
    payload: string(),
  }),
  object({
    type: literal("SET_RESERVATION_DATE"),
    payload: string(),
  }),
  object({
    type: literal("SET_RESERVATION_TIME"),
    payload: string(),
  }),
  object({
    type: literal("SET_IMAGE_INFORMATION"),
    payload: nullable(vImageInformation),
  }),
  object({
    type: literal("INITIALIZE"),
    payload: object({
      date: instance(Date),
      title: string(),
      enTitle: string(),
      caption: string(),
      enCaption: string(),
      themeId: nullable(string()),
      albumId: nullable(string()),
      link: string(),
      tags: array(vTag),
      useTagFeature: boolean(),
      useCommentFeature: boolean(),
      usePromotionFeature: boolean(),
      useGenerationParams: boolean(),
      ratingRestriction: vPostRating,
      accessType: vPostAccessType,
      imageStyle: union([
        literal("ILLUSTRATION"),
        literal("REAL"),
        literal("SEMI_REAL"),
      ]),
      aiModelId: string(),
      reservationDate: nullable(string()),
      reservationTime: nullable(string()),
      imageInformation: nullable(vImageInformation),
    }),
  }),
])
