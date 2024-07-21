import type { PostTextFormAction } from "@/routes/($lang)._main.new.text/reducers/actions/post-text-form-action";
import type { PostTextFormState } from "@/routes/($lang)._main.new.text/reducers/states/post-text-form-state";

export const postTextFormReducer = (
  state: PostTextFormState,
  action: PostTextFormAction
): PostTextFormState => {
  switch (action.type) {
    case "SET_PNG_INFO": {
      return {
        ...state,
        pngInfo: action.payload,
      };
    }
    case "ADD_INDEX": {
      return {
        ...state,
        indexList: [...state.indexList, action.payload],
      };
    }
    case "REMOVE_INDEX": {
      return {
        ...state,
        indexList: state.indexList.filter((index) => {
          return index !== action.payload;
        }),
      };
    }
    case "SET_THUMBNAIL_BASE64": {
      return {
        ...state,
        thumbnailBase64: action.payload,
      };
    }
    case "SET_OGP_BASE64": {
      return {
        ...state,
        ogpBase64: action.payload,
      };
    }
    case "SET_THUMBNAIL_POS_X": {
      return {
        ...state,
        thumbnailPosX: action.payload,
      };
    }
    case "SET_THUMBNAIL_POS_Y": {
      return {
        ...state,
        thumbnailPosY: action.payload,
      };
    }
    case "SET_IS_THUMBNAIL_LANDSCAPE": {
      return {
        ...state,
        isThumbnailLandscape: action.payload,
      };
    }
    case "SET_PROGRESS": {
      return {
        ...state,
        progress: action.payload,
      };
    }
    case "OPEN_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: action.payload,
      };
    }
    case "OPEN_LOADING_AI": {
      return {
        ...state,
        isOpenLoadingAi: action.payload,
      };
    }
    case "SET_IS_DRAWING": {
      return {
        ...state,
        isDrawing: action.payload,
      };
    }
    case "SET_EDIT_TARGET_IMAGE_BASE64": {
      return {
        ...state,
        editTargetImageBase64: action.payload,
      };
    }
    case "SET_EDITED_IMAGE": {
      const updatedItems = state.items.map((item) =>
        item.content === state.editTargetImageBase64
          ? { ...item, content: action.payload.base64 }
          : item
      );
      const [item] = updatedItems;
      const thumbnailBase64 =
        item.content === state.editTargetImageBase64
          ? action.payload.base64
          : state.thumbnailBase64;
      return {
        ...state,
        items: updatedItems,
        thumbnailBase64: thumbnailBase64,
        editTargetImageBase64: null,
        ogpBase64: null,
      };
    }
    case "SET_ITEMS": {
      return {
        ...state,
        items: action.payload,
      };
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
      };
    }
    case "SET_INDEX_LIST": {
      return {
        ...state,
        indexList: action.payload,
      };
    }
    case "CLOSE_IMAGE_GENERATION_DIALOG": {
      return {
        ...state,
        isOpenImageGenerationDialog: false,
      };
    }
    case "IS_SELECTED_GENERATION_IMAGE": {
      return {
        ...state,
        isSelectedGenerationImage: action.payload,
      };
    }
    case "SUBMIT_IMAGE_GENERATION_DIALOG": {
      const newItems: { id: number; content: string }[] =
        action.payload.selectedImageGenerationUrls.reduce(
          (acc: { id: number; content: string }[], url: string) => {
            if (!state.items.some((item) => item.content === url)) {
              acc.push({
                id: Math.floor(Math.random() * 10000),
                content: url,
              });
            }
            return acc;
          },
          []
        );

      return {
        ...state,
        isOpenImageGenerationDialog: false,
        items: [...state.items, ...newItems],
      };
    }
    case "MARK_AS_DONE":
      return {
        ...state,
        progress: 100,
        uploadedWorkId: action.payload.uploadedWorkId,
        uploadedWorkUuid: action.payload.uploadedWorkUuid,
      };
    // すべてリセット
    case "INITIALIZE":
      return {
        ...state,
        progress: 0,
        items: action.payload.items,
        indexList: [],
        isThumbnailLandscape: action.payload.isThumbnailLandscape,
        thumbnailBase64: action.payload.thumbnailBase64,
        ogpBase64: action.payload.ogpBase64,
        pngInfo: action.payload.pngInfo,
        thumbnailPosX: action.payload.thumbnailPosX,
        thumbnailPosY: action.payload.thumbnailPosY,
      };
  }

  throw new Error("Invalid action type");
};
