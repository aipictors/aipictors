import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import { appendGenerationItems } from "~/routes/($lang)._main.new.image/utils/append-generation-items"

export const postImageFormReducer = (
  state: PostImageFormState,
  action: PostImageFormAction,
): PostImageFormState => {
  switch (action.type) {
    case "SET_PNG_INFO": {
      return {
        ...state,
        pngInfo: action.payload,
      }
    }
    case "ADD_INDEX": {
      return {
        ...state,
        indexList: [...state.indexList, action.payload],
      }
    }
    case "REMOVE_INDEX": {
      return {
        ...state,
        indexList: state.indexList.filter((index) => {
          return index !== action.payload
        }),
      }
    }
    case "SET_THUMBNAIL_BASE64": {
      return {
        ...state,
        thumbnailBase64: action.payload,
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
    case "SET_VIDEO_FILE": {
      return {
        ...state,
        videoFile: action.payload ? (action.payload as File) : null,
      }
    }
    case "SET_VIDEO_DURATION_SECONDS": {
      return {
        ...state,
        videoDurationSeconds: action.payload,
      }
    }
    case "OPEN_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: action.payload,
      }
    }
    case "OPEN_LOADING_AI": {
      return {
        ...state,
        isOpenLoadingAi: action.payload,
      }
    }
    case "SET_IS_DRAWING": {
      return {
        ...state,
        isDrawing: action.payload,
      }
    }
    case "SET_EDIT_TARGET_IMAGE_BASE64": {
      return {
        ...state,
        editTargetImageBase64: action.payload,
      }
    }
    case "SET_EDITED_IMAGE": {
      const updatedItems = state.items.map((item) =>
        item.content === state.editTargetImageBase64
          ? { ...item, content: action.payload.base64 }
          : item,
      )
      const [item] = updatedItems
      const thumbnailBase64 =
        item.content === state.editTargetImageBase64
          ? action.payload.base64
          : state.thumbnailBase64
      return {
        ...state,
        items: updatedItems,
        thumbnailBase64: thumbnailBase64,
        editTargetImageBase64: null,
        ogpBase64: null,
      }
    }
    case "REPLACE_ITEM": {
      const { from, item: next } = action.payload
      const index = state.items.findIndex(
        (item) => item.id === next.id && item.content === from,
      )
      if (index === -1) return state
      const items = [...state.items]
      items[index] = next
      const isThumbnail = state.thumbnailBase64 === from
      return {
        ...state,
        items,
        thumbnailBase64: isThumbnail ? next.content : state.thumbnailBase64,
        // OGP は前のサムネイルから切り出したものなので、作り直してもらう
        ogpBase64: isThumbnail && state.ogpBase64 ? "" : state.ogpBase64,
      }
    }
    case "SET_ITEMS": {
      return {
        ...state,
        items: action.payload,
      }
    }
    case "ADD_IMAGE": {
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: Math.floor(Math.random() * 10000),
            content: action.payload.imageId,
          },
        ],
      }
    }
    case "SET_INDEX_LIST": {
      return {
        ...state,
        indexList: action.payload,
      }
    }
    case "CLOSE_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: false,
      }
    }
    case "IS_SELECTED_GENERATION_IMAGE": {
      return {
        ...state,
        isSelectedGenerationImage: action.payload,
      }
    }
    case "SUBMIT_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: false,
        // nanoid は生成履歴に「投稿済み」の印を付けるのと、同じ画像を二重に足さないために持っておく
        items: appendGenerationItems(
          state.items,
          action.payload.selectedImageGenerationUrls,
          action.payload.selectedImageGenerationNanoids,
        ),
      }
    }
    case "MARK_AS_DONE":
      return {
        ...state,
        progress: 100,
        uploadedWorkId: action.payload.uploadedWorkId,
        uploadedWorkUuid: action.payload.uploadedWorkUuid,
      }
    // すべてリセット
    case "INITIALIZE":
      return {
        editTargetImageBase64: null,
        isDrawing: false,
        isHovered: false,
        isOpenImageGenerationDialog: false,
        progress: 0,
        items: action.payload.items,
        indexList: action.payload.indexList,
        isThumbnailLandscape: action.payload.isThumbnailLandscape,
        thumbnailBase64: action.payload.thumbnailBase64,
        ogpBase64: action.payload.ogpBase64,
        pngInfo: action.payload.pngInfo,
        thumbnailPosX: action.payload.thumbnailPosX,
        thumbnailPosY: action.payload.thumbnailPosY,
        isSelectedGenerationImage: action.payload.isSelectedGenerationImage,
        selectedImageGenerationIds: [],
        uploadedWorkId: null,
        uploadedWorkUuid: null,
        videoFile: null,
        videoDurationSeconds: null,
        isOpenLoadingAi: false,
      }
  }

  throw new Error("Invalid action type")
}
