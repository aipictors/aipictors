import { vPostAccessType } from "~/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostImageStyle } from "~/routes/($lang)._main.new.image/validations/post-image-style"
import { vPostRating } from "~/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "~/routes/($lang)._main.new.image/validations/post-tag"
import {
  object,
  string,
  boolean,
  date,
  array,
  nullable,
  type InferInput,
} from "valibot"

export type PostAnimationFormInputState = InferInput<
  typeof vPostAnimationFormInputState
>

export const vPostAnimationFormInputState = object({
  accessType: vPostAccessType,
  aiModelId: nullable(string()),
  albumId: nullable(string()),
  caption: string(),
  date: date(),
  enCaption: string(),
  enTitle: string(),
  animationStyle: vPostImageStyle,
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
})
