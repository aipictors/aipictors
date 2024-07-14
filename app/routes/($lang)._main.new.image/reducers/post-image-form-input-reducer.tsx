import type { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import type { vPostImageInputState } from "@/routes/($lang)._main.new.image/validations/post-image-form-input-state"
import { object, string, type InferInput } from "valibot"

export type PostImageFormInputState = InferInput<typeof vPostImageInputState>

const vTag = object({
  id: string(),
  text: string(),
})

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
      type: "SET_GENERATION_PARAMS_FEATURE"
      payload: boolean
    }
  | {
      type: "SET_TAGS"
      payload: InferInput<typeof vTag>[]
    }
  | {
      type: "SET_IMAGE_INFORMATION"
      payload: InferInput<typeof vImageInformation> | null
    }

export const postImageFormInputReducer = (
  state: PostImageFormInputState,
  action: PostImageFormInputAction,
): PostImageFormInputState => {
  switch (action.type) {
    case "SET_TITLE": {
      return {
        ...state,
        title: action.payload,
      }
    }
    case "SET_DATE": {
      return {
        ...state,
        date: action.payload,
      }
    }
    case "SET_TAGS": {
      return {
        ...state,
        tags: action.payload,
      }
    }
    case "ADD_TAG": {
      return {
        ...state,
        tags: [...state.tags, action.payload],
      }
    }
    case "REMOVE_TAG": {
      return {
        ...state,
        tags: state.tags.filter((tag) => tag.id !== action.payload),
      }
    }
    case "SET_EN_TITLE": {
      return {
        ...state,
        enTitle: action.payload,
      }
    }
    case "SET_CAPTION": {
      return {
        ...state,
        caption: action.payload,
      }
    }
    case "SET_EN_CAPTION": {
      return {
        ...state,
        enCaption: action.payload,
      }
    }
    case "SET_THEME_ID": {
      if (action.payload.themeId === null) {
        return {
          ...state,
          themeId: null,
          tags: state.tags.filter((tag) => {
            return tag.text !== action.payload.themeTitle
          }),
        }
      }
      const hasThemeTag = state.tags.some((tag) => {
        return tag.id === "9999"
      })
      if (hasThemeTag) {
        return {
          ...state,
          themeId: action.payload.themeId,
        }
      }
      return {
        ...state,
        themeId: action.payload.themeId,
        tags: [
          ...state.tags,
          {
            id: "9999",
            text: action.payload.themeTitle,
          },
        ],
      }
    }
    case "SET_ALBUM_ID": {
      return {
        ...state,
        albumId: action.payload,
      }
    }
    case "SET_LINK": {
      return {
        ...state,
        link: action.payload,
      }
    }
    case "ENABLE_TAG_FEATURE": {
      return {
        ...state,
        useTagFeature: action.payload,
      }
    }
    case "ENABLE_COMMENT_FEATURE": {
      return {
        ...state,
        useCommentFeature: action.payload,
      }
    }
    case "ENABLE_PROMOTION_FEATURE": {
      return {
        ...state,
        usePromotionFeature: action.payload,
      }
    }
    case "ENABLE_GENERATION_PARAMS_FEATURE": {
      return {
        ...state,
        useGenerationParams: action.payload,
      }
    }
    case "SET_RATING_RESTRICTION": {
      return {
        ...state,
        ratingRestriction: action.payload,
      }
    }
    case "SET_ACCESS_TYPE": {
      return {
        ...state,
        accessType: action.payload,
      }
    }
    case "SET_IMAGE_STYLE": {
      return {
        ...state,
        imageStyle: action.payload,
      }
    }
    case "SET_AI_MODEL_ID": {
      return {
        ...state,
        aiModelId: action.payload,
      }
    }
    case "SET_RESERVATION_DATE": {
      // TODO: お題が存在しない日の場合はお題の項目を見えないようにする
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const threeDaysLater = new Date(today)
      threeDaysLater.setDate(today.getDate() + 7)
      const changeDate = new Date(action.payload)
      changeDate.setHours(0, 0, 0, 0)
      if (changeDate >= today && changeDate <= threeDaysLater) {
        return {
          ...state,
          reservationDate: action.payload,
          date: changeDate,
          themeId: null,
        }
      }
      return {
        ...state,
        reservationDate: action.payload,
        themeId: null,
      }
    }
    case "SET_RESERVATION_TIME": {
      return {
        ...state,
        reservationTime: action.payload,
      }
    }
    case "SET_IMAGE_INFORMATION": {
      return {
        ...state,
        imageInformation: action.payload,
      }
    }
  }

  throw new Error("Invalid action type")
}
