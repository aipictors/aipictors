import type { Dispatch } from "react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type { TranslationFn } from "~/hooks/use-translation"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import {
  hasPersistablePostInput,
  hasPersistablePostMedia,
  loadBotSettings,
  loadPostFormDraft,
  loadPostMediaDraft,
  removePostFormDraft,
  removePostMediaDraft,
  saveBotSettings,
  savePostFormDraft,
  savePostMediaDraft,
} from "~/routes/($lang)._main.new.image/utils/post-image-draft"

type Props = {
  state: PostImageFormState
  inputState: PostImageFormInputState
  dispatch: Dispatch<PostImageFormAction>
  dispatchInput: Dispatch<PostImageFormInputAction>
  requestedMediaType: "image" | "video"
  t: TranslationFn
}

/**
 * 投稿の下書きを復元・保存する。復元で動画と画像が切り替わるので、選択中の種類もここで持つ
 */
export function usePostImageDraft(props: Props) {
  const { state, inputState, dispatch, dispatchInput, requestedMediaType, t } =
    props

  const [isInitialized, setIsInitialized] = useState(false)
  const hasStartedDraftRestoreRef = useRef(false)
  const [mediaType, setMediaType] = useState<"image" | "video">(
    requestedMediaType,
  )

  useEffect(() => {
    if (state.videoFile === null && state.items.length === 0) {
      setMediaType(requestedMediaType)
    }
  }, [requestedMediaType, state.items.length, state.videoFile])

  // コンポーネントマウント後にlocalStorageから設定を読み込み
  useEffect(() => {
    if (isInitialized || hasStartedDraftRestoreRef.current) {
      return
    }

    hasStartedDraftRestoreRef.current = true

    let cancelled = false
    const timer = setTimeout(() => {
      void (async () => {
        const storedSettings = loadBotSettings()
        if (storedSettings) {
          dispatchInput({
            type: "SET_BOT_GRADING_ENABLED",
            payload: storedSettings.isBotGradingEnabled ?? true,
          })
          dispatchInput({
            type: "SET_BOT_GRADING_PUBLIC",
            payload: storedSettings.isBotGradingPublic ?? true,
          })
          dispatchInput({
            type: "SET_BOT_GRADING_RANKING_ENABLED",
            payload: storedSettings.isBotGradingRankingEnabled ?? true,
          })
          dispatchInput({
            type: "SET_BOT_PERSONALITY",
            payload: storedSettings.botPersonality ?? "pictor_chan",
          })
          dispatchInput({
            type: "SET_BOT_GRADING_TYPE",
            payload: storedSettings.botGradingType ?? "COMMENT_AND_SCORE",
          })
        }

        let restoredAnything = false

        const inputDraft = loadPostFormDraft()
        if (inputDraft && !cancelled) {
          dispatchInput(inputDraft)
          restoredAnything = true
        }

        const mediaDraft = await loadPostMediaDraft()
        if (mediaDraft && !cancelled) {
          dispatch(mediaDraft)
          setMediaType("image")
          restoredAnything = true
        }

        if (restoredAnything && !cancelled) {
          toast(
            t(
              "前回の投稿入力を復元しました",
              "Restored your previous post draft",
            ),
          )
        }

        if (!cancelled) {
          setIsInitialized(true)
        }
      })()
    }, 100) // 100msの遅延

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isInitialized])

  // AI評価設定の変更をlocalStorageに保存
  useEffect(() => {
    if (isInitialized) {
      const settings = {
        isBotGradingEnabled: inputState.isBotGradingEnabled,
        isBotGradingPublic: inputState.isBotGradingPublic,
        isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
        botPersonality: inputState.botPersonality,
        botGradingType: inputState.botGradingType,
      }
      saveBotSettings(settings)
    }
  }, [
    inputState.isBotGradingEnabled,
    inputState.isBotGradingPublic,
    inputState.isBotGradingRankingEnabled,
    inputState.botPersonality,
    inputState.botGradingType,
    isInitialized,
  ])

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (state.uploadedWorkId !== null) {
      removePostFormDraft()
      return
    }

    const hasPersistableInput = hasPersistablePostInput(inputState)

    if (!hasPersistableInput) {
      removePostFormDraft()
      return
    }

    savePostFormDraft({
      ...inputState,
      aiModelId: inputState.aiModelId ?? "1",
      date: inputState.date.toISOString(),
    })
  }, [inputState, isInitialized, state.uploadedWorkId])

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (state.uploadedWorkId !== null) {
      void removePostMediaDraft()
      return
    }

    if (state.progress > 0) {
      return
    }

    const hasPersistableMedia = hasPersistablePostMedia(state)

    void (async () => {
      if (!hasPersistableMedia) {
        await removePostMediaDraft()
        return
      }

      await savePostMediaDraft({
        items: state.items,
        indexList: state.indexList,
        isThumbnailLandscape: state.isThumbnailLandscape,
        thumbnailBase64: state.thumbnailBase64,
        ogpBase64: state.ogpBase64,
        pngInfo: state.pngInfo,
        thumbnailPosX: state.thumbnailPosX,
        thumbnailPosY: state.thumbnailPosY,
        isSelectedGenerationImage: state.isSelectedGenerationImage,
      })
    })()
  }, [
    isInitialized,
    state.items,
    state.indexList,
    state.isSelectedGenerationImage,
    state.isThumbnailLandscape,
    state.ogpBase64,
    state.pngInfo,
    state.progress,
    state.thumbnailBase64,
    state.thumbnailPosX,
    state.thumbnailPosY,
    state.uploadedWorkId,
  ])

  return { mediaType, setMediaType }
}
