import type { PostImageFormAction } from "@/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "@/routes/($lang)._main.new.image/reducers/states/post-image-form-state"

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
    case "ADD_ITEM": {
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    }
    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => {
          return item.id !== action.payload
        }),
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
    case "SET_IS_CREATED_WORK": {
      return {
        ...state,
        isCreatedWork: action.payload,
      }
    }
    case "SET_UPLOADED_WORK_ID": {
      return {
        ...state,
        uploadedWorkId: action.payload,
      }
    }
    case "SET_UPLOADED_WORK_UUID": {
      return {
        ...state,
        uploadedWorkUuid: action.payload,
      }
    }
    case "SET_PROGRESS": {
      return {
        ...state,
        progress: action.payload,
      }
    }
    case "SET_IS_OPEN_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: action.payload,
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
    case "CLOSE_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: false,
      }
    }
    case "SET_INDEX_LIST": {
      return {
        ...state,
        indexList: action.payload,
      }
    }
  }

  throw new Error("Invalid action type")
}