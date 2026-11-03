import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useBeforeUnload, useLoaderData } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { useCallback, useContext, useEffect, useReducer, useState } from "react"
import { safeParse } from "valibot"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ModerationFixBanner } from "~/components/moderation/moderation-fix-banner"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { PostImageFormInput } from "~/routes/($lang)._main.new.image/components/post-image-form-input"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { postImageFormInputReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { postImageFormReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { EditImageFormUploader } from "~/routes/($lang)._main.posts.$post.image.edit._index/components/edit-image-form-uploader"
import { useEditImageSubmit } from "~/routes/($lang)._main.posts.$post.image.edit._index/hooks/use-edit-image-submit"
import {
  createEditImageFormState,
  toEditImageInputPayload,
  toEditImageMediaPayload,
} from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-form-state"
import {
  viewerQuery,
  workQuery,
} from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-queries"
import { getJstDate } from "~/utils/jst-date"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {
    id: props.params.post,
  }
}

export const headers: HeadersFunction = () => ({
  // 編集画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

export default function EditImage() {
  const authContext = useContext(AuthContext)

  const t = useTranslation()

  const data = useLoaderData<typeof loader>()

  const { data: workWithAuth = null, loading } = useQuery(workQuery, {
    skip: authContext.isLoading,
    variables: {
      id: data.id,
    },
  })

  const work = workWithAuth?.work ?? null

  console.log("work:", work)

  useEffect(() => {
    if (work) {
      console.log("Work data loaded:", {
        isBotGradingPublic: work?.isBotGradingPublic,
        isBotGradingRankingEnabled: work?.isBotGradingRankingEnabled,
        isBotGradingEnabled: work?.isBotGradingEnabled,
      })

      console.log("About to set inputState with:", {
        isBotGradingPublic: Boolean(work?.isBotGradingPublic ?? false),
        isBotGradingRankingEnabled: Boolean(
          work?.isBotGradingRankingEnabled ?? true,
        ),
        isBotGradingEnabled: Boolean(work?.isBotGradingEnabled ?? false),
      })

      // 画像関連のstateを初期化
      dispatch({
        type: "INITIALIZE",
        payload: toEditImageMediaPayload(work),
      })

      // フォーム入力stateを初期化（AI評価設定も含む）
      dispatchInput({
        type: "INITIALIZE",
        payload: toEditImageInputPayload(work),
      })

      console.log("=== After INITIALIZE dispatch ===")
      // dispatchは非同期なので、次のrender cycleでinputStateが更新される
    }
  }, [work])

  const [state, dispatch] = useReducer(
    postImageFormReducer,
    createEditImageFormState(work),
  )

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
    isBotGradingEnabled: false,
    isBotGradingPublic: false,
    isBotGradingRankingEnabled: false,
    botPersonality: "pictor_chan",
    botGradingType: "COMMENT_AND_SCORE",
  })

  // inputStateのAI評価設定値の変化を監視
  useEffect(() => {
    console.log("=== inputState AI評価設定 values changed ===")
    console.log("inputState.isBotGradingPublic:", inputState.isBotGradingPublic)
    console.log(
      "inputState.isBotGradingRankingEnabled:",
      inputState.isBotGradingRankingEnabled,
    )
    console.log(
      "inputState.isBotGradingEnabled:",
      inputState.isBotGradingEnabled,
    )
  }, [
    inputState.isBotGradingPublic,
    inputState.isBotGradingRankingEnabled,
    inputState.isBotGradingEnabled,
  ])

  const now = getJstDate(new Date())

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      startAt: new Date().toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  })

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
  })

  const onPost = useEditImageSubmit({
    work,
    state,
    inputState,
    dispatch,
    formResult,
    token: viewer?.viewer?.token,
    userId: authContext.userId,
  })

  // inputStateの変更を監視（デバッグ用）
  useEffect(() => {
    console.log("=== inputState changed ===")
    console.log("isBotGradingPublic:", inputState.isBotGradingPublic)
    console.log(
      "isBotGradingRankingEnabled:",
      inputState.isBotGradingRankingEnabled,
    )
    console.log("isBotGradingEnabled:", inputState.isBotGradingEnabled)
  }, [
    inputState.isBotGradingPublic,
    inputState.isBotGradingRankingEnabled,
    inputState.isBotGradingEnabled,
  ])

  // AI評価設定の変更をUIに即座反映する関数
  const handleBotGradingPublicChange = useCallback(
    (isPublic: boolean) => {
      console.log("=== handleBotGradingPublicChange called ===")
      console.log("New value:", isPublic)
      console.log("Current inputState before change:", {
        isBotGradingPublic: inputState.isBotGradingPublic,
        isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
      })
      dispatchInput({
        type: "SET_BOT_GRADING_PUBLIC",
        payload: isPublic,
      })
      console.log("Dispatched SET_BOT_GRADING_PUBLIC with:", isPublic)
    },
    [
      dispatchInput,
      inputState.isBotGradingPublic,
      inputState.isBotGradingRankingEnabled,
    ],
  )

  const handleBotGradingRankingChange = useCallback(
    (enabled: boolean) => {
      console.log("=== handleBotGradingRankingChange called ===")
      console.log("New value:", enabled)
      console.log("Current inputState before change:", {
        isBotGradingPublic: inputState.isBotGradingPublic,
        isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
      })
      dispatchInput({
        type: "SET_BOT_GRADING_RANKING_ENABLED",
        payload: enabled,
      })
      console.log("Dispatched SET_BOT_GRADING_RANKING_ENABLED with:", enabled)
    },
    [
      dispatchInput,
      inputState.isBotGradingPublic,
      inputState.isBotGradingRankingEnabled,
    ],
  )

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  const [disabledSubmit, setDisabledSubmit] = useState(false)

  useBeforeUnload(
    useCallback(
      (event) => {
        if (state) {
          const confirmationMessage =
            "ページ遷移すると変更が消えますが問題無いですか？"
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [state],
    ),
  )

  if (data === null) {
    return null
  }

  if (!loading && work === null) {
    return (
      <div className="m-auto text-center">
        <p className="text-center">{t("作品が存在しません", "Not found")}</p>
        <Link className="m-auto text-blue-600" to={"/my"}>
          {t("ダッシュボードへ", "Dashboard")}
        </Link>
      </div>
    )
  }

  return work?.user !== null && work?.user.id === authContext.userId ? (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <div className="space-y-4">
        {work?.moderatorReport?.status === "UNHANDLED" && (
          <ModerationFixBanner
            reportType={work.moderatorReport.reportType ?? null}
            reportMessage={work.moderatorReport.reportMessage ?? null}
            isTemporaryPrivate={work.adminAccessType === "TEMPORARY_PRIVATE"}
          />
        )}
        <EditImageFormUploader state={state} dispatch={dispatch} />
        <PostImageFormInput
          imageInformation={state.pngInfo}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
          recentlyUsedTags={viewer?.viewer?.recentlyUsedTags ?? []}
          eventInputHidden={false}
          setDisabledSubmit={setDisabledSubmit}
          themes={
            viewer?.dailyThemes
              ? viewer.dailyThemes.map((theme) => ({
                  date: theme.dateText,
                  title: theme.title,
                  id: theme.id,
                }))
              : null
          }
          aiModels={viewer?.aiModels ?? []}
          events={(viewer?.appEvents ?? []).map((event) => ({
            ...event,
            source: "OFFICIAL" as const,
          }))}
          needFix={work?.moderatorReport?.status === "UNHANDLED"}
          isEditMode={true}
          // AI評価セクション用のprops
          aiEvaluationProps={{
            workId: work?.id || "",
            isAlreadyRequested: Boolean(work?.isBotGradingEnabled),
            isAlreadyEvaluated: work?.botEvaluationStatus === "DONE",
            evaluationStatus: work?.botEvaluationStatus ?? null,
            isBotGradingEnabled: Boolean(work?.isBotGradingEnabled),
            // inputStateの値を直接使用
            currentBotGradingPublic: inputState.isBotGradingPublic,
            currentBotGradingRankingEnabled:
              inputState.isBotGradingRankingEnabled,
            smallThumbnailImageURL: work?.smallThumbnailImageURL,
            userToken: viewer?.viewer?.token,
            onChangeBotGradingPublic: handleBotGradingPublicChange,
            onChangeBotGradingRankingEnabled: handleBotGradingRankingChange,
          }}
        />
        <div className="h-4" />
        <Button
          disabled={disabledSubmit}
          className="fixed bottom-0 left-0 z-30 ml-0 w-full rounded-none p-0 md:ml-[72px] md:pr-[72px] lg:ml-[224px] lg:pr-[224px] xl:left-auto xl:m-0 xl:max-w-[1200px] xl:pl-[8%]"
          size={"lg"}
          type="submit"
          onClick={onPost}
        >
          {"更新"}
        </Button>
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
        text={"更新中"}
      />
    </div>
  ) : (
    <div>
      <AppLoadingPage />
    </div>
  )
}
