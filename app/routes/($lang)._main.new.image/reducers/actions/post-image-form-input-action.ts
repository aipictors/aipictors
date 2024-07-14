import type { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import type { vTag } from "@/routes/($lang)._main.new.image/validations/post-tag"
import type { InferInput } from "valibot"

export type PostImageFormInputAction =
  | {
      type: "SET_DATE"
      payload: Date
    }
  | {
      type: "SET_TITLE"
      payload: string
    }
  | {
      type: "SET_EN_TITLE"
      payload: string
    }
  | {
      type: "SET_CAPTION"
      payload: string
    }
  | {
      type: "SET_EN_CAPTION"
      payload: string
    }
  | {
      type: "SET_THEME_ID"
      payload:
        | {
            themeId: string
            themeTitle: string
          }
        | {
            themeId: null
            themeTitle: string
          }
    }
  | {
      type: "SET_ALBUM_ID"
      payload: string
    }
  | {
      /**
       * URLを設定する
       */
      type: "SET_LINK"
      payload: string
    }
  | {
      /**
       * タグを追加する
       */
      type: "ADD_TAG"
      payload: InferInput<typeof vTag>
    }
  | {
      type: "REMOVE_TAG"
      payload: string
    }
  | {
      type: "ENABLE_TAG_FEATURE"
      payload: boolean
    }
  | {
      type: "ENABLE_COMMENT_FEATURE"
      payload: boolean
    }
  | {
      type: "ENABLE_PROMOTION_FEATURE"
      payload: boolean
    }
  | {
      type: "ENABLE_GENERATION_PARAMS_FEATURE"
      payload: boolean
    }
  | {
      type: "SET_RATING_RESTRICTION"
      payload: "G" | "R15" | "R18" | "R18G"
    }
  | {
      type: "SET_ACCESS_TYPE"
      payload: "PUBLIC" | "SILENT" | "LIMITED" | "PRIVATE" | "DRAFT"
    }
  | {
      type: "SET_IMAGE_STYLE"
      payload: "ILLUSTRATION" | "REAL" | "SEMI_REAL"
    }
  | {
      type: "SET_AI_MODEL_ID"
      payload: string
    }
  | {
      /**
       * 投稿時刻を設定する
       */
      type: "SET_RESERVATION_DATE"
      /**
       * 日付
       */
      payload: string
    }
  | {
      type: "SET_RESERVATION_TIME"
      payload: string
    }
  | {
      type: "SET_TAGS"
      payload: InferInput<typeof vTag>[]
    }
  | {
      type: "SET_IMAGE_INFORMATION"
      payload: InferInput<typeof vImageInformation> | null
    }
