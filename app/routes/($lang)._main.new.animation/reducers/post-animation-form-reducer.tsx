import type { PostAnimationFormAction } from "@/routes/($lang)._main.new.animation/reducers/actions/post-animation-form-action"
import type { PostAnimationFormState } from "@/routes/($lang)._main.new.animation/reducers/states/post-animation-form-state"

export const postAnimationFormReducer = (
  state: PostAnimationFormState,
  action: PostAnimationFormAction,
): PostAnimationFormState => {
  switch (action.type) {
    case "SET_THUMBNAIL_BASE64": {
      return {
        ...state,
        thumbnailBase64: action.payload,
      }
    }
    case "SET_ANIMATION_FILE": {
      return {
        ...state,
        videoFile: action.payload ? (action.payload as File) : null,
      }
    }
    case "SET_OGP_BASE64": {
      return {
        ...state,
        ogpBase64: action.payload,
      }
    }
    case "SET_THUMBNAIL_POS_X": {
      return {
        ...state,
        thumbnailPosX: action.payload,
      }
    }
    case "SET_THUMBNAIL_POS_Y": {
      return {
        ...state,
        thumbnailPosY: action.payload,
      }
    }
    case "SET_IS_THUMBNAIL_LANDSCAPE": {
      return {
        ...state,
        isThumbnailLandscape: action.payload,
      }
    }
    case "SET_PROGRESS": {
      return {
        ...state,
        progress: action.payload,
      }
    }
    case "MARK_AS_DONE":
      return {
        ...state,
        progress: 100,
        uploadedWorkId: action.payload.uploadedWorkId,
        uploadedWorkUuid: action.payload.uploadedWorkUuid,
      }
  }

  throw new Error("Invalid action type")
}
