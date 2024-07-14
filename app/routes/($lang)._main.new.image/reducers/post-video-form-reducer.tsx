import type { vImageInformation } from "@/routes/($lang)._main.new.image/validations/image-information"
import type { vSortableItem } from "@/routes/($lang)._main.new.image/validations/sortable-item"
import type { InferInput } from "valibot"

export type PostVideoFormAction =
  | {
      type: "SET_PNG_INFO"
      payload: InferInput<typeof vImageInformation> | null
    }
  | {
      type: "SET_IS_DRAWING"
      payload: boolean
    }
  | {
      type: "SET_EDITED_IMAGE"
      payload: {
        base64: string
      }
    }
  | {
      type: "SET_EDIT_TARGET_IMAGE_BASE64"
      payload: string | null
    }
  | {
      type: "ADD_ITEM"
      payload: InferInput<typeof vSortableItem>
    }
  | {
      type: "REMOVE_ITEM"
      payload: number
    }
  | {
      type: "ADD_INDEX"
      payload: number
    }
  | {
      type: "REMOVE_INDEX"
      payload: number
    }
  | {
      type: "SET_THUMBNAIL_BASE64"
      payload: string | null
    }
  | {
      type: "SET_OGP_BASE64"
      payload: string | null
    }
  | {
      type: "SET_THUMBNAIL_POS_X"
      payload: number
    }
  | {
      type: "SET_THUMBNAIL_POS_Y"
      payload: number
    }
  | {
      type: "SET_IS_THUMBNAIL_LANDSCAPE"
      payload: boolean
    }
  | {
      type: "SET_IS_CREATED_WORK"
      payload: boolean
    }
  | {
      type: "SET_UPLOADED_WORK_ID"
      payload: string
    }
  | {
      type: "SET_UPLOADED_WORK_UUID"
      payload: string | null
    }
  | {
      type: "SET_PROGRESS"
      payload: number
    }
  | {
      type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG"
      payload: boolean
    }
  | {
      type: "SET_ITEMS"
      payload: InferInput<typeof vSortableItem>[]
    }
  | {
      type: "SET_INDEX_LIST"
      payload: number[]
    }
  | {
      type: "ADD_IMAGE"
      payload: {
        imageId: string
      }
    }
  | {
      type: "CLOSE_IMAGE_GENERATION_DIALOG"
    }
