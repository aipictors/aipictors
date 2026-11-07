import { useQuery } from "@apollo/client/index"
import type { HeadersFunction } from "@remix-run/cloudflare"
import {
  type MetaFunction,
  useBeforeUnload,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { Loader2Icon } from "lucide-react"
import {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react"
import type { LoaderFunctionArgs } from "react-router-dom"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { Button } from "~/components/ui/button"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { PostFormSubmitBar } from "~/routes/($lang)._main.new.image/components/post-form-submit-bar"
import { PostImageFormInput } from "~/routes/($lang)._main.new.image/components/post-image-form-input"
import { PostImageFormUploader } from "~/routes/($lang)._main.new.image/components/post-image-form-uploader"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { usePostImageDraft } from "~/routes/($lang)._main.new.image/hooks/use-post-image-draft"
import { usePostImageGenerationResults } from "~/routes/($lang)._main.new.image/hooks/use-post-image-generation-results"
import { usePostImageSearchParams } from "~/routes/($lang)._main.new.image/hooks/use-post-image-search-params"
import { usePostImageSubmit } from "~/routes/($lang)._main.new.image/hooks/use-post-image-submit"
import { postImageFormInputReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { postImageFormReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import {
  SelectedUserEventQuery,
  UserEventsQuery,
  ViewerQuery,
} from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import {
  mergePostFormEvents,
  type RawEventOption,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import {
  applyGeneratedContentToPostForm,
  type PostFormGeneratedContent,
} from "~/routes/($lang)._main.new.image/utils/post-form-generated-content"
import {
  clearPersistedPostDrafts,
  createInitialPostImageFormInputState,
  INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
} from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { createMeta } from "~/utils/create-meta"
import type { PNGInfo } from "~/utils/get-extract-info-from-png"
import { getJstDate } from "~/utils/jst-date"

export default function NewImage() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [searchParams] = useSearchParams()
  const requestedMediaType = searchParams.get("media") === "video"
    ? "video"
    : "image"

  const ref = searchParams.get("generation")
  const generationNanoids = ref?.split("|").filter(Boolean) ?? []
  const eventSlug = searchParams.get("event")

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewerData, loading } = useQuery(ViewerQuery, {
    skip: !authContext.isLoggedIn,
    errorPolicy: "all",
    fetchPolicy: "cache-and-network", // お題データの最新状態を取得するためキャッシュを無効化
    variables: {
      offset: 0,
      limit: 128,
      withGenerationResults: generationNanoids.length > 0,
      generationLimit: 64,
      generationOffset: 0,
      generationWhere:
        generationNanoids.length > 0
          ? {
              nanoids: generationNanoids,
            }
          : undefined,
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
  })

  const { data: userEventsData } = useQuery(UserEventsQuery, {
    errorPolicy: "all",
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    variables: {
      limit: 24,
      offset: 0,
      endAt: now.toISOString().split("T")[0],
    },
  })

  const { data: selectedUserEventData } = useQuery(SelectedUserEventQuery, {
    skip: !eventSlug,
    errorPolicy: "all",
    variables: {
      slug: eventSlug ?? "",
    },
  })

  const viewer = data
  const currentViewer = viewerData?.viewer ?? viewer?.viewer ?? null
  const currentAiModels = viewerData?.aiModels ?? viewer?.aiModels ?? []

  const eventDataSource = viewerData ?? viewer

  const appEvents: RawEventOption[] = Array.isArray(eventDataSource.appEvents)
    ? (eventDataSource.appEvents as RawEventOption[])
    : []

  const userEvents: RawEventOption[] = Array.isArray(userEventsData?.userEvents)
    ? (userEventsData.userEvents as RawEventOption[])
    : []

  const selectedUserEvent = selectedUserEventData?.userEvent as
    | RawEventOption
    | undefined

  const events = mergePostFormEvents({
    appEvents,
    userEvents,
    selectedUserEvent,
  })

  const [state, dispatch] = useReducer(postImageFormReducer, {
    editTargetImageBase64: null,
    indexList: [],
    isDrawing: false,
    isHovered: false,
    isOpenImageGenerationDialog: false,
    isSelectedGenerationImage: false,
    isThumbnailLandscape: false,
    items: [],
    ogpBase64: null,
    pngInfo: null,
    progress: 0,
    selectedImageGenerationIds: [],
    thumbnailBase64: null,
    thumbnailPosX: 0,
    thumbnailPosY: 0,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile: null,
    videoDurationSeconds: null,
    isOpenLoadingAi: false,
  })

  const [inputState, dispatchInput] = useReducer(postImageFormInputReducer, {
    accessType: "PUBLIC",
    generationParamAccessType: "PUBLIC",
    aiModelId: "1",
    albumId: null,
    caption: "",
    date: new Date(),
    enCaption: "",
    enTitle: "",
    imageInformation: null,
    imageStyle: "ILLUSTRATION",
    link: "",
    ratingRestriction: "G",
    reservationDate: null,
    reservationTime: null,
    tags: [],
    themeId: null,
    title: "",
    useCommentFeature: true,
    useGenerationParams: true,
    usePromotionFeature: false,
    useTagFeature: true,
    correctionMessage: "",
    // デフォルト値（永続化設定で上書きされる）
    isBotGradingEnabled: true,
    isBotGradingPublic: true,
    isBotGradingRankingEnabled: true,
    botPersonality: "pictor_chan",
    botGradingType: "COMMENT_AND_SCORE",
  })

  const { mediaType, setMediaType } = usePostImageDraft({
    state,
    inputState,
    dispatch,
    dispatchInput,
    requestedMediaType,
    t,
  })

  const onChangeImageInformation = (imageInformation: PNGInfo) => {
    dispatchInput({
      type: "SET_IMAGE_INFORMATION",
      payload: imageInformation,
    })
  }

  usePostImageGenerationResults({
    ref,
    viewerData,
    dispatch,
    dispatchInput,
    t,
  })

  const isPostingRef = useRef(false)

  usePostImageSearchParams({
    searchParams,
    tags: inputState.tags,
    dailyThemes: viewer?.dailyThemes,
    now,
    dispatchInput,
  })

  /**
   * AI生成されたコンテンツをフォームに反映する
   */
  const onContentGenerated = (data: PostFormGeneratedContent) => {
    applyGeneratedContentToPostForm({
      data,
      tags: inputState.tags,
      dispatchInput,
    })
  }

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
  })

  const onPost = usePostImageSubmit({
    state,
    inputState,
    dispatch,
    mediaType,
    events,
    formResult,
    token: currentViewer?.token,
    userId: authContext.userId,
    isNotLoggedIn: authContext.isNotLoggedIn,
    isPostingRef,
    t,
  })

  const resetImageSelectionForVideo = () => {
    dispatch({ type: "SET_ITEMS", payload: [] })
    dispatch({ type: "SET_INDEX_LIST", payload: [] })
    dispatch({ type: "SET_PNG_INFO", payload: null })
    dispatch({ type: "IS_SELECTED_GENERATION_IMAGE", payload: false })
    dispatch({ type: "SET_EDIT_TARGET_IMAGE_BASE64", payload: null })
    dispatchInput({ type: "SET_IMAGE_INFORMATION", payload: null })
  }

  const onVideoChange = (
    videoFile: File | null,
    videoDurationSeconds: number | null = null,
  ) => {
    if (videoFile !== null && state.items.length > 0) {
      resetImageSelectionForVideo()
    }

    dispatch({ type: "SET_VIDEO_FILE", payload: videoFile })
    dispatch({ type: "SET_VIDEO_DURATION_SECONDS", payload: videoDurationSeconds })
    setMediaType(videoFile ? "video" : requestedMediaType)
  }

  const onImageSelectionChange = (itemsCount: number) => {
    if (itemsCount > 0 && state.videoFile) {
      dispatch({ type: "SET_VIDEO_FILE", payload: null })
      dispatch({ type: "SET_VIDEO_DURATION_SECONDS", payload: null })
    }

    if (itemsCount > 0) {
      setMediaType("image")
    }
  }

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  const onInputFiles = async (_files: FileList) => {
    // if (inputState.ratingRestriction !== "G") {
    //   return
    // }
    // // AI判定処理
    // dispatch({ type: "OPEN_LOADING_AI", payload: true })
    // const fileArray = Array.from(files)
    // const results = await Promise.all(
    //   fileArray.map(async (file) => {
    //     try {
    //       const nsfwInfo = await getNsfwPredictions(file)
    //       return nsfwInfo
    //     } catch (error) {
    //       console.error("Error processing NSFW predictions:", error)
    //       return null
    //     }
    //   }),
    // )
    // const validResults = results.filter(
    //   (nsfwInfo) => nsfwInfo !== null,
    // ) as NsfwResults[]
    // const mostSuitableStyle = validResults.reduce(
    //   (currentStyle, nsfwInfo) => {
    //     if (nsfwInfo.drawings >= 0.7) {
    //       return "ILLUSTRATION"
    //     }
    //     if (nsfwInfo.drawings >= 0.5) {
    //       return "SEMI_REAL"
    //     }
    //     return "REAL"
    //   },
    //   "ILLUSTRATION" as "ILLUSTRATION" | "REAL" | "SEMI_REAL",
    // )
    // const strictestRating = validResults.reduce(
    //   (currentRating, nsfwInfo) => {
    //     const newRating =
    //       nsfwInfo.hentai >= 0.7
    //         ? "R18"
    //         : nsfwInfo.hentai >= 0.05 ||
    //             nsfwInfo.porn >= 0.5 ||
    //             nsfwInfo.sexy >= 0.8
    //           ? "R15"
    //           : "G"
    //     if (
    //       inputState.ratingRestriction === "R18G" ||
    //       inputState.ratingRestriction === "R18"
    //     ) {
    //       return inputState.ratingRestriction
    //     }
    //     return newRating === "R18" ||
    //       (newRating === "R15" && currentRating === "G")
    //       ? newRating
    //       : currentRating
    //   },
    //   "G" as "G" | "R15" | "R18" | "R18G",
    // )
    // dispatchInput({ type: "SET_RATING_RESTRICTION", payload: strictestRating })
    // dispatchInput({ type: "SET_IMAGE_STYLE", payload: mostSuitableStyle })
    // dispatch({ type: "OPEN_LOADING_AI", payload: false })
  }

  const onResetAllInputs = useCallback(async () => {
    if (state.progress !== 0) {
      return
    }

    dispatch({
      type: "INITIALIZE",
      payload: INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
    })

    dispatchInput({
      type: "INITIALIZE",
      payload: createInitialPostImageFormInputState(),
    })

    setMediaType(requestedMediaType)
    isPostingRef.current = false

    await clearPersistedPostDrafts()

    toast(
      t(
        "入力内容と一時保存データをリセットしました",
        "Inputs and saved draft data were reset",
      ),
    )
  }, [requestedMediaType, state.progress, t])

  // ユーザーが実際に作品投稿に関する入力をしているかチェックする関数
  const hasUserInput = useCallback(() => {
    return (
      state.thumbnailBase64 !== null ||
      inputState.title.trim() !== "" ||
      inputState.caption.trim() !== "" ||
      inputState.enTitle.trim() !== "" ||
      inputState.enCaption.trim() !== "" ||
      inputState.tags.length > 0 ||
      state.items.length > 0 ||
      state.videoFile !== null ||
      inputState.link.trim() !== "" ||
      inputState.reservationDate !== null ||
      inputState.reservationTime !== null
    )
  }, [
    state.thumbnailBase64,
    state.items.length,
    state.videoFile,
    inputState.title,
    inputState.caption,
    inputState.enTitle,
    inputState.enCaption,
    inputState.tags.length,
    inputState.link,
    inputState.reservationDate,
    inputState.reservationTime,
  ])

  // ブラウザ離脱時の確認ダイアログ（リロード・タブ閉じる・外部サイトへの遷移）
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUserInput()) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure you want to leave this page? Your changes will be lost.",
          )
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [hasUserInput, t],
    ),
  )

  // Reactコンポーネントのunmount時の警告（アプリ内ページ遷移）
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUserInput()) {
        const confirmationMessage = t(
          "ページ遷移すると変更が消えますが問題無いですか？",
          "Are you sure you want to leave this page? Your changes will be lost.",
        )
        event.returnValue = confirmationMessage
        return confirmationMessage
      }
    }

    // カスタムイベントリスナーでルート変更を検知
    const handleRouteChange = () => {
      if (hasUserInput()) {
        const shouldProceed = window.confirm(
          t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure you want to leave this page? Your changes will be lost.",
          ),
        )

        if (!shouldProceed) {
          // ユーザーがキャンセルした場合、履歴を一つ戻す
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    // popstateイベント（ブラウザの戻る/進むボタン）をリッスン
    window.addEventListener("popstate", handleRouteChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUserInput, t])

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <div className="max-w-[1200px] space-y-4">
        <PostFormHeader type="media" />
        <div className="relative">
          {state.isOpenLoadingAi && (
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-2 rounded-full bg-black/70 px-3 py-1 text-xs">
              <Loader2Icon className="size-4 animate-spin text-white" />
              <p className="text-white">
                {t(
                  "AIでテイスト、年齢種別を判定中",
                  "Analyzing the image for style and age restrictions using AI",
                )}
              </p>
            </div>
          )}
          <PostImageFormUploader
            mediaType={mediaType}
            currentPassType={currentViewer?.currentPass?.type ?? null}
            onChangeImageInformation={onChangeImageInformation}
            onChangeMediaType={setMediaType}
            onImageSelectionChange={onImageSelectionChange}
            onVideoChange={onVideoChange}
            state={state}
            dispatch={dispatch}
            onInputFiles={onInputFiles}
            token={currentViewer?.token}
            onContentGenerated={onContentGenerated}
          />
        </div>
        <PostImageFormInput
          imageInformation={inputState.imageInformation}
          mediaType={mediaType}
          state={inputState}
          dispatch={dispatchInput}
          albums={currentViewer?.albums ?? []}
          currentPass={currentViewer?.currentPass ?? null}
          recentlyUsedTags={currentViewer?.recentlyUsedTags ?? []}
          themes={
            viewer?.dailyThemes
              ? viewer.dailyThemes.map((theme) => ({
                  date: theme.dateText,
                  title: theme.title,
                  id: theme.id,
                  note: theme.note ?? null,
                }))
              : null
          }
          aiModels={currentAiModels}
          events={events}
          needFix={false}
          imageBase64={state.thumbnailBase64}
          token={currentViewer?.token}
          onContentGenerated={onContentGenerated}
          isAdvancedCollapsed
        />
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled={state.progress !== 0}
            onClick={() => {
              void onResetAllInputs()
            }}
          >
            {t("入力を全てリセット", "Reset all inputs")}
          </Button>
        </div>
        <PostFormSubmitBar
          requirements={[
            {
              label: t("画像・動画", "Image / video"),
              isDone: state.items.length > 0 || state.videoFile !== null,
            },
            {
              label: t("タイトル", "Title"),
              isDone: inputState.title.trim().length > 0,
            },
          ]}
          isNotLoggedIn={authContext.isNotLoggedIn}
          isLoading={authContext.isLoading || loading}
          isDisabled={state.progress !== 0 || state.uploadedWorkId !== null}
          onSubmit={onPost}
        />
      </div>
      <SuccessCreatedWorkDialog
          showAutoModeration
        isOpen={state.progress === 100}
        title={inputState.title}
        description={inputState.caption}
        imageBase64={state.thumbnailBase64}
        workId={state.uploadedWorkId}
        uuid={state.uploadedWorkUuid}
        shareTags={["Aipictors", "AIイラスト", "AIart"]}
        createdAt={createdAt.getTime()}
        accessType={inputState.accessType}
      />
      <CreatingWorkDialog
        progress={state.progress}
        isOpen={state.progress !== 0 && state.progress !== 100}
      />
    </div>
  )
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_IMAGE, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const result = await loaderClient.query({
    query: ViewerQuery,
    variables: {
      offset: 0,
      limit: 128,
      withGenerationResults: false,
      generationLimit: 64,
      generationOffset: 0,
      generationWhere: undefined,
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
  })

  return {
    ...result.data,
  }
}

export const headers: HeadersFunction = () => ({
  // 投稿画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})
