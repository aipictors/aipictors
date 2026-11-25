import {
  array,
  boolean,
  date,
  type InferInput,
  literal,
  nullable,
  object,
  optional,
  string,
  union,
} from "valibot"
import { vImageInformation } from "~/routes/($lang)._main.new.image/validations/image-information"
import { vPostAccessType } from "~/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostGenerationParamAccessType } from "~/routes/($lang)._main.new.image/validations/post-generation-params-access-type"
import { vPostImageStyle } from "~/routes/($lang)._main.new.image/validations/post-image-style"
import { vPostRating } from "~/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "~/routes/($lang)._main.new.image/validations/post-tag"

export type PostImageFormInputState = InferInput<
  typeof vPostImageFormInputState
>

export const vPostImageFormInputState = object({
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
  /** FANZA の販売ページの URL（R18 の作品だけ。編集では作品の値を入れる） */
  fanzaUrl: optional(string()),
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
  correctionMessage: nullable(string()),
  isBotGradingEnabled: boolean(),
  isBotGradingPublic: boolean(),
  isBotGradingRankingEnabled: boolean(),
  botPersonality: union([
    literal("female"),
    literal("male"),
    literal("robot"),
    literal("sage"),
    literal("pictor_chan"),
  ]),
  botGradingType: union([
    literal("COMMENT_ONLY"),
    literal("SCORE_ONLY"),
    literal("COMMENT_AND_SCORE"),
  ]),
})
