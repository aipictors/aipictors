import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import { vPostAccessType } from "@/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostGenerationParamAccessType } from "@/routes/($lang)._main.new.image/validations/post-generation-params-access-type"
import { vPostImageStyle } from "@/routes/($lang)._main.new.image/validations/post-image-style"
import { vPostRating } from "@/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "@/routes/($lang)._main.new.image/validations/post-tag"
import { vPostType } from "@/routes/($lang)._main.new.image/validations/post-type"
import {
  object,
  string,
  boolean,
  date,
  array,
  nullable,
  type InferInput,
} from "valibot"

export type PostTextFormInputState = InferInput<typeof vPostTextFormInputState>

export const vPostTextFormInputState = object({
  accessType: vPostAccessType,
  generationParamAccessType: vPostGenerationParamAccessType,
  aiModelId: nullable(string()),
  albumId: nullable(string()),
  caption: string(),
  date: date(),
  enCaption: string(),
  enTitle: string(),
  imageInformation: nullable(vImageInformation),
  imageStyle: vPostImageStyle,
  link: string(),
  ratingRestriction: vPostRating,
  reservationDate: nullable(string()),
  reservationTime: nullable(string()),
  tags: array(vTag),
  themeId: nullable(string()),
  title: string(),
  useCommentFeature: boolean(),
  useGenerationParams: boolean(),
  usePromotionFeature: boolean(),
  useTagFeature: boolean(),
  md: string(),
  type: nullable(vPostType),
})