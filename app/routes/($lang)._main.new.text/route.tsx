import { useQuery } from "@apollo/client/index"
import type { HeadersFunction } from "@remix-run/cloudflare"
import {
  type MetaFunction,
  useBeforeUnload,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import React, { useContext, useEffect, useReducer } from "react"
import type { LoaderFunctionArgs } from "react-router-dom"
import { safeParse } from "valibot"
import { Button } from "~/components/ui/button"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { PostFormSubmitBar } from "~/routes/($lang)._main.new.image/components/post-form-submit-bar"
import { PostTextFormInput } from "~/routes/($lang)._main.new.image/components/post-text-form-input"
import { PostTextFormUploader } from "~/routes/($lang)._main.new.image/components/post-text-form-uploader"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import {
  mergePostFormEvents,
  type RawEventOption,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"
import { usePostTextGenerationResults } from "~/routes/($lang)._main.new.text/hooks/use-post-text-generation-results"
import { usePostTextSubmit } from "~/routes/($lang)._main.new.text/hooks/use-post-text-submit"
import { useTextDraft } from "~/routes/($lang)._main.new.text/hooks/use-text-draft"
import { postTextFormInputReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-input-reducer"
import { postTextFormReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-reducer"
import {
  SelectedUserEventQuery,
  UserEventsQuery,
  viewerQuery,
} from "~/routes/($lang)._main.new.text/utils/new-text-queries"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"

export default function NewText() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [searchParams] = useSearchParams()

  const ref = searchParams.get("generation")
  const eventSlug = searchParams.get("event")

  const generationNanoids = ref?.split("|").filter(Boolean) ?? []

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewerData } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      generationLimit: generationNanoids.length > 0 ? 64 : 0,
      generationOffset: 0,
      generationWhere: {
        nanoids: generationNanoids,
      },
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

  const appEvents: RawEventOption[] = Array.isArray(viewerData?.appEvents)
    ? (viewerData.appEvents as RawEventOption[])
    : Array.isArray(data.appEvents)
      ? (data.appEvents as RawEventOption[])
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

  const [state, dispatch] = useReducer(postTextFormReducer, {
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
    isOpenLoadingAi: false,
  })

  const [inputState, dispatchInput] = useReducer(postTextFormInputReducer, {
    accessType: "PUBLIC",
    generationParamAccessType: "PUBLIC",
    aiModelId: "1",
    albumId: null,
    caption: "",
    isCaptionBeforeBody: false,
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
    md: "",
    type: "COLUMN",
    correctionMessage: "",
  })

  usePostTextGenerationResults({
    generationNanoids,
    viewerData,
    dispatch,
  })

  const formResult = safeParse(vPostTextForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
    md: inputState.md,
  })

  const onPost = usePostTextSubmit({
    state,
    inputState,
    dispatch,
    events,
    formResult,
    token: viewerData?.viewer?.token,
    userId: authContext.userId,
    t,
  })

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  const draft = useTextDraft({
    userId: authContext.userId,
    current: {
      title: inputState.title,
      caption: inputState.caption,
      md: inputState.md,
      type: inputState.type === "NOVEL" ? "NOVEL" : "COLUMN",
    },
  })

  // 投稿できたら書きかけは消す
  useEffect(() => {
    if (state.progress === 100) {
      draft.clear()
    }
  }, [state.progress])

  const restoreDraft = () => {
    const restorable = draft.restorable
    if (restorable === null) {
      return
    }
    dispatchInput({ type: "SET_TITLE", payload: restorable.title })
    dispatchInput({ type: "SET_CAPTION", payload: restorable.caption })
    dispatchInput({ type: "SET_MD", payload: restorable.md })
    dispatchInput({ type: "SET_TYPE", payload: restorable.type })
    draft.decide()
  }

  const isDirty =
    inputState.title.trim() !== "" ||
    inputState.caption.trim() !== "" ||
    inputState.md.trim() !== "" ||
    state.items.length > 0

  useBeforeUnload(
    React.useCallback(
      (event) => {
        // 何も入力していないとき・投稿が済んだあとは確認しない
        if (isDirty && state.progress !== 100) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure to leave this page? Changes may be lost.",
          )
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [isDirty, state.progress, t],
    ),
  )

  if (data === null) {
    return null
  }

  type DailyTheme = {
    id: string
    title: string
    dateText: string
    note?: string | null
  }

  const themes = viewerData?.dailyThemes
    ? (viewerData.dailyThemes as DailyTheme[]).map((theme) => ({
        date: theme.dateText,
        title: theme.title,
        id: theme.id,
        note: theme.note ?? null,
      }))
    : null

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <div className="space-y-4">
        <PostFormHeader type="text" />
        {draft.restorable && (
          <div className="flex flex-col gap-2 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium">
                {t("書きかけの下書きがあります", "You have an unsaved draft")}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {draft.restorable.title.trim() ||
                  draft.restorable.md.replace(/\s+/g, " ").slice(0, 40) ||
                  t("（タイトルなし）", "(Untitled)")}
                {" ・ "}
                {new Date(draft.restorable.savedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" onClick={restoreDraft}>
                {t("続きから書く", "Restore")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={draft.discard}
              >
                {t("破棄", "Discard")}
              </Button>
            </div>
          </div>
        )}
        <PostTextFormInput
          afterBody={<PostTextFormUploader state={state} dispatch={dispatch} />}
          imageInformation={state.pngInfo}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewerData?.albums ?? []}
          currentPass={viewerData?.viewer?.currentPass ?? null}
          recentlyUsedTags={viewerData?.viewer?.recentlyUsedTags ?? []}
          themes={themes}
          aiModels={viewerData?.aiModels ?? []}
          events={events}
          needFix={false}
          isAdvancedCollapsed
        />
        <PostFormSubmitBar
          requirements={[
            {
              label: t("カバー画像", "Cover image"),
              isDone: state.thumbnailBase64 !== null,
            },
            {
              label: t("タイトル", "Title"),
              isDone: inputState.title.trim().length > 0,
            },
            {
              label: t("本文", "Body"),
              isDone: inputState.md.trim().length > 0,
            },
          ]}
          isNotLoggedIn={authContext.isNotLoggedIn}
          isLoading={authContext.isLoading}
          isDisabled={state.progress !== 0}
          onSubmit={onPost}
          note={
            draft.savedAt
              ? t("下書きを自動保存しました", "Draft saved")
              : undefined
          }
        />
      </div>
      <SuccessCreatedWorkDialog
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
  return createMeta(META.NEW_TEXT, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const result = await loaderClient.query({
    query: viewerQuery,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: "-1",
      generationLimit: 64,
      generationOffset: 0,
      generationWhere: {
        nanoids: [],
      },
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
