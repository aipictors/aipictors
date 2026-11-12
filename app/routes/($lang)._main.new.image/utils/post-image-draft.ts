import { type GenericSchema, type InferOutput, safeParse } from "valibot"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import { vImageInformation } from "~/routes/($lang)._main.new.image/validations/image-information"
import { vPostAccessType } from "~/routes/($lang)._main.new.image/validations/post-access-type"
import { vPostGenerationParamAccessType } from "~/routes/($lang)._main.new.image/validations/post-generation-params-access-type"
import { vPostImageStyle } from "~/routes/($lang)._main.new.image/validations/post-image-style"
import { vPostRating } from "~/routes/($lang)._main.new.image/validations/post-rating"
import { vTag } from "~/routes/($lang)._main.new.image/validations/post-tag"
import { vSortableItem } from "~/routes/($lang)._main.new.image/validations/sortable-item"

export const POST_IMAGE_FORM_DRAFT_STORAGE_KEY = "post-image-form-draft:v1"
export const POST_IMAGE_MEDIA_DRAFT_DB_NAME = "aipictors-post-drafts"
export const POST_IMAGE_MEDIA_DRAFT_STORE_NAME = "new-image"
export const POST_IMAGE_MEDIA_DRAFT_KEY = "media:v1"
export const BOT_PERSONALITIES = [
  "female",
  "male",
  "robot",
  "sage",
  "pictor_chan",
]
export const BOT_GRADING_TYPES = [
  "COMMENT_ONLY",
  "SCORE_ONLY",
  "COMMENT_AND_SCORE",
]

export const normalizeString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback
}

export const normalizeNullableString = (value: unknown) => {
  return typeof value === "string" && value.trim().length > 0 ? value : null
}

export const normalizeBoolean = (value: unknown, fallback = false) => {
  return typeof value === "boolean" ? value : fallback
}

export const normalizeNumber = (value: unknown, fallback = 0) => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

export const normalizeDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date
    }
  }

  return new Date()
}

export const normalizeEnum = <T extends GenericSchema>(
  validator: T,
  value: unknown,
  fallback: InferOutput<T>,
): InferOutput<T> => {
  const result = safeParse(validator, value)
  return result.success ? result.output : fallback
}

export const normalizeTags = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((tag) => {
    const result = safeParse(vTag, tag)
    return result.success ? [result.output] : []
  })
}

export const normalizeSortableItems = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    const result = safeParse(vSortableItem, item)
    return result.success ? [result.output] : []
  })
}

export const normalizeNumberArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is number => {
    return typeof item === "number" && Number.isFinite(item)
  })
}

export const normalizeImageInformation = (value: unknown) => {
  const result = safeParse(vImageInformation, value)
  return result.success ? result.output : null
}

export const normalizeBotPersonality = (value: unknown) => {
  return typeof value === "string" && BOT_PERSONALITIES.includes(value)
    ? (value as "female" | "male" | "robot" | "sage" | "pictor_chan")
    : "pictor_chan"
}

export const normalizeBotGradingType = (value: unknown) => {
  return typeof value === "string" && BOT_GRADING_TYPES.includes(value)
    ? (value as "COMMENT_ONLY" | "SCORE_ONLY" | "COMMENT_AND_SCORE")
    : "COMMENT_AND_SCORE"
}

export const openPostDraftDatabase = async () => {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null
  }

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(POST_IMAGE_MEDIA_DRAFT_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(POST_IMAGE_MEDIA_DRAFT_STORE_NAME)) {
        db.createObjectStore(POST_IMAGE_MEDIA_DRAFT_STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open draft database"))
    }
  })
}

export const loadPostFormDraft = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const stored = window.localStorage.getItem(
      POST_IMAGE_FORM_DRAFT_STORAGE_KEY,
    )
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored)
    if (typeof parsed !== "object" || parsed === null) {
      window.localStorage.removeItem(POST_IMAGE_FORM_DRAFT_STORAGE_KEY)
      return null
    }

    const draft = parsed as Record<string, unknown>

    return {
      type: "INITIALIZE" as const,
      payload: {
        accessType: normalizeEnum(vPostAccessType, draft.accessType, "PUBLIC"),
        generationParamAccessType: normalizeEnum(
          vPostGenerationParamAccessType,
          draft.generationParamAccessType,
          "PUBLIC",
        ),
        aiModelId: normalizeString(draft.aiModelId, "1"),
        albumId: normalizeNullableString(draft.albumId),
        caption: normalizeString(draft.caption),
        date: normalizeDate(draft.date),
        enCaption: normalizeString(draft.enCaption),
        enTitle: normalizeString(draft.enTitle),
        imageInformation: normalizeImageInformation(draft.imageInformation),
        imageStyle: normalizeEnum(
          vPostImageStyle,
          draft.imageStyle,
          "ILLUSTRATION",
        ),
        link: normalizeString(draft.link),
        ratingRestriction: normalizeEnum(
          vPostRating,
          draft.ratingRestriction,
          "G",
        ),
        reservationDate: normalizeNullableString(draft.reservationDate),
        reservationTime: normalizeNullableString(draft.reservationTime),
        tags: normalizeTags(draft.tags),
        themeId: normalizeNullableString(draft.themeId),
        title: normalizeString(draft.title),
        useCommentFeature: normalizeBoolean(draft.useCommentFeature, true),
        useGenerationParams: normalizeBoolean(draft.useGenerationParams, true),
        usePromotionFeature: normalizeBoolean(draft.usePromotionFeature, false),
        useTagFeature: normalizeBoolean(draft.useTagFeature, true),
        correctionMessage: normalizeNullableString(draft.correctionMessage),
        isBotGradingEnabled: normalizeBoolean(draft.isBotGradingEnabled, true),
        isBotGradingPublic: normalizeBoolean(draft.isBotGradingPublic, true),
        isBotGradingRankingEnabled: normalizeBoolean(
          draft.isBotGradingRankingEnabled,
          true,
        ),
        botPersonality: normalizeBotPersonality(draft.botPersonality),
        botGradingType: normalizeBotGradingType(draft.botGradingType),
      },
    }
  } catch (error) {
    console.warn("Failed to load post form draft:", error)
    window.localStorage.removeItem(POST_IMAGE_FORM_DRAFT_STORAGE_KEY)
    return null
  }
}

export const savePostFormDraft = (payload: Record<string, unknown>) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    window.localStorage.setItem(
      POST_IMAGE_FORM_DRAFT_STORAGE_KEY,
      JSON.stringify(payload),
    )
  } catch (error) {
    console.warn("Failed to save post form draft:", error)
  }
}

export const removePostFormDraft = () => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(POST_IMAGE_FORM_DRAFT_STORAGE_KEY)
}

export const loadPostMediaDraft = async () => {
  try {
    const db = await openPostDraftDatabase()
    if (!db) {
      return null
    }

    const draft = await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction(
        POST_IMAGE_MEDIA_DRAFT_STORE_NAME,
        "readonly",
      )
      const request = transaction
        .objectStore(POST_IMAGE_MEDIA_DRAFT_STORE_NAME)
        .get(POST_IMAGE_MEDIA_DRAFT_KEY)

      request.onsuccess = () => resolve(request.result ?? null)
      request.onerror = () => {
        reject(request.error ?? new Error("Failed to read media draft"))
      }
      transaction.oncomplete = () => db.close()
      transaction.onerror = () => {
        db.close()
        reject(transaction.error ?? new Error("Failed to read media draft"))
      }
    })

    if (typeof draft !== "object" || draft === null) {
      return null
    }

    const parsedDraft = draft as Record<string, unknown>

    return {
      type: "INITIALIZE" as const,
      payload: {
        items: normalizeSortableItems(parsedDraft.items),
        indexList: normalizeNumberArray(parsedDraft.indexList),
        isThumbnailLandscape: normalizeBoolean(
          parsedDraft.isThumbnailLandscape,
          false,
        ),
        thumbnailBase64: normalizeNullableString(parsedDraft.thumbnailBase64),
        ogpBase64: normalizeNullableString(parsedDraft.ogpBase64),
        pngInfo: normalizeImageInformation(parsedDraft.pngInfo),
        thumbnailPosX: normalizeNumber(parsedDraft.thumbnailPosX),
        thumbnailPosY: normalizeNumber(parsedDraft.thumbnailPosY),
        isSelectedGenerationImage: normalizeBoolean(
          parsedDraft.isSelectedGenerationImage,
          false,
        ),
      },
    }
  } catch (error) {
    console.warn("Failed to load post media draft:", error)
    return null
  }
}

export const savePostMediaDraft = async (payload: Record<string, unknown>) => {
  try {
    const db = await openPostDraftDatabase()
    if (!db) {
      return
    }

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        POST_IMAGE_MEDIA_DRAFT_STORE_NAME,
        "readwrite",
      )
      transaction
        .objectStore(POST_IMAGE_MEDIA_DRAFT_STORE_NAME)
        .put(payload, POST_IMAGE_MEDIA_DRAFT_KEY)

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error ?? new Error("Failed to save media draft"))
      }
    })
  } catch (error) {
    console.warn("Failed to save post media draft:", error)
  }
}

export const removePostMediaDraft = async () => {
  try {
    const db = await openPostDraftDatabase()
    if (!db) {
      return
    }

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        POST_IMAGE_MEDIA_DRAFT_STORE_NAME,
        "readwrite",
      )
      transaction
        .objectStore(POST_IMAGE_MEDIA_DRAFT_STORE_NAME)
        .delete(POST_IMAGE_MEDIA_DRAFT_KEY)

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
      transaction.onerror = () => {
        db.close()
        reject(transaction.error ?? new Error("Failed to remove media draft"))
      }
    })
  } catch (error) {
    console.warn("Failed to remove post media draft:", error)
  }
}

export const clearPersistedPostDrafts = async () => {
  removePostFormDraft()
  await removePostMediaDraft()
}

export const INITIAL_POST_IMAGE_FORM_MEDIA_STATE = {
  items: [],
  indexList: [],
  isThumbnailLandscape: false,
  thumbnailBase64: null,
  ogpBase64: null,
  pngInfo: null,
  thumbnailPosX: 0,
  thumbnailPosY: 0,
  isSelectedGenerationImage: false,
}

export const createInitialPostImageFormInputState = () => ({
  accessType: "PUBLIC" as const,
  generationParamAccessType: "PUBLIC" as const,
  aiModelId: "1",
  albumId: null,
  caption: "",
  date: new Date(),
  enCaption: "",
  enTitle: "",
  imageInformation: null,
  imageStyle: "ILLUSTRATION" as const,
  link: "",
  ratingRestriction: "G" as const,
  reservationDate: null,
  reservationTime: null,
  tags: [],
  themeId: null,
  title: "",
  useCommentFeature: true,
  useGenerationParams: true,
  usePromotionFeature: false,
  useTagFeature: true,
  correctionMessage: null,
  isBotGradingEnabled: true,
  isBotGradingPublic: true,
  isBotGradingRankingEnabled: true,
  botPersonality: "pictor_chan" as const,
  botGradingType: "COMMENT_AND_SCORE" as const,
})

// localStorageから設定を読み込む関数
export const loadBotSettings = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("post-bot-grading-settings")
      if (stored) {
        return JSON.parse(stored)
      }
    }
  } catch (error) {
    console.warn("Failed to load bot settings:", error)
  }
  return null
}

// localStorageに設定を保存する関数
export const saveBotSettings = (settings: {
  isBotGradingEnabled: boolean
  isBotGradingPublic: boolean
  isBotGradingRankingEnabled: boolean
  botPersonality: string
  botGradingType: string
}) => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "post-bot-grading-settings",
        JSON.stringify(settings),
      )
    }
  } catch (error) {
    console.warn("Failed to save bot settings:", error)
  }
}

/**
 * 保存してある画像の下書きを戻してよいか。
 *
 * 生成履歴から投稿しようとしているときに戻すと、選んだ画像が前回の下書きで
 * 上書きされてしまう（複数選んだのに 1 枚になる）
 */
export const shouldRestoreMediaDraft = (params: {
  hasGenerationParam: boolean
  currentItemCount: number
}) => {
  return !params.hasGenerationParam && params.currentItemCount === 0
}

/**
 * 下書きとして残す入力があるか
 */
export const hasPersistablePostInput = (
  inputState: PostImageFormInputState,
) => {
  return (
    inputState.title.trim() !== "" ||
    inputState.caption.trim() !== "" ||
    inputState.enTitle.trim() !== "" ||
    inputState.enCaption.trim() !== "" ||
    inputState.tags.length > 0 ||
    inputState.accessType !== "PUBLIC" ||
    inputState.generationParamAccessType !== "PUBLIC" ||
    inputState.ratingRestriction !== "G" ||
    inputState.imageStyle !== "ILLUSTRATION" ||
    inputState.aiModelId !== "1" ||
    inputState.themeId !== null ||
    inputState.albumId !== null ||
    inputState.link.trim() !== "" ||
    inputState.reservationDate !== null ||
    inputState.reservationTime !== null ||
    inputState.imageInformation !== null ||
    inputState.useTagFeature === false ||
    inputState.useCommentFeature === false ||
    inputState.usePromotionFeature ||
    inputState.useGenerationParams === false ||
    (inputState.correctionMessage?.trim() ?? "") !== ""
  )
}

/**
 * 下書きとして残す画像の情報があるか
 */
export const hasPersistablePostMedia = (state: PostImageFormState) => {
  return (
    state.items.length > 0 ||
    state.thumbnailBase64 !== null ||
    state.ogpBase64 !== null ||
    state.pngInfo !== null ||
    state.indexList.length > 0 ||
    state.thumbnailPosX !== 0 ||
    state.thumbnailPosY !== 0 ||
    state.isSelectedGenerationImage
  )
}
