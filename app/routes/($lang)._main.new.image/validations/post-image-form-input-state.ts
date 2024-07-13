import { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import {
  object,
  string,
  boolean,
  date,
  array,
  nullable,
  literal,
  union,
} from "valibot"

const vTag = object({
  id: string(),
  text: string(),
})

export const vPostImageInputState = object({
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
  ratingRestriction: union([
    literal("G"),
    literal("R15"),
    literal("R18"),
    literal("R18G"),
  ]),
  accessType: union([
    literal("PUBLIC"),
    literal("SILENT"),
    literal("LIMITED"),
    literal("PRIVATE"),
    literal("DRAFT"),
  ]),
  imageStyle: union([
    literal("ILLUSTRATION"),
    literal("REAL"),
    literal("SEMI_REAL"),
  ]),
  aiModelId: nullable(string()),
  reservationDate: nullable(string()),
  reservationTime: nullable(string()),
})
