import type { PostImageFormInputAction } from "@/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "@/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"

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
      const daysLater = new Date(today)
      daysLater.setDate(today.getDate() + 7)
      const changeDate = new Date(action.payload)
      changeDate.setHours(0, 0, 0, 0)
      if (changeDate >= today && changeDate <= daysLater) {
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
    case "INITIALIZE": {
      return {
        ...state,
        title: action.payload.title,
        date: action.payload.date,
        tags: action.payload.tags,
        enTitle: action.payload.enTitle,
        caption: action.payload.caption,
        enCaption: action.payload.enCaption,
        themeId: action.payload.themeId,
        albumId: action.payload.albumId,
        link: action.payload.link,
        useTagFeature: action.payload.useTagFeature,
        useCommentFeature: action.payload.useCommentFeature,
        usePromotionFeature: action.payload.usePromotionFeature,
        useGenerationParams: action.payload.useGenerationParams,
        ratingRestriction: action.payload.ratingRestriction,
        accessType: action.payload.accessType,
        imageStyle: action.payload.imageStyle,
        aiModelId: action.payload.aiModelId,
        reservationDate: action.payload.reservationDate,
        reservationTime: action.payload.reservationTime,
        imageInformation: action.payload.imageInformation,
      }
    }
  }

  throw new Error("Invalid action type")
}
