import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import { vPostAccessType } from "@/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostImageStyle } from "@/routes/($lang)._main.new.image/validations/post-image-style"
import { vPostRating } from "@/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "@/routes/($lang)._main.new.image/validations/post-tag"
import {
  object,
  string,
  boolean,
  date,
  array,
  nullable,
  type InferInput,
} from "valibot"

export type PostImageFormInputState = InferInput<
  typeof vPostImageFormInputState
>

export const vPostImageFormInputState = object({
  imageInformation: nullable(vImageInformation),
  date: date(),
  title: nullable(string()),
  enTitle: nullable(string()),
  caption: nullable(string()),
  enCaption: nullable(string()),
  themeId: nullable(string()),
  albumId: nullable(string()),
  link: nullable(string()),
  tags: array(vTag),
  useTagFeature: boolean(),
  useCommentFeature: boolean(),
  usePromotionFeature: boolean(),
  useGenerationParams: boolean(),
  ratingRestriction: vPostRating,
  accessType: vPostAccessType,
  imageStyle: vPostImageStyle,
  aiModelId: nullable(string()),
  reservationDate: nullable(string()),
  reservationTime: nullable(string()),
})
