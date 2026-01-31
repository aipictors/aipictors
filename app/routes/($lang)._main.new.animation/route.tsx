import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { uploadPublicVideo } from "~/utils/upload-public-video"
import {
  PostAnimationFormInput,
  PostAnimationFormAiModelFragment,
  PostAnimationFormAlbumFragment,
  PostAnimationFormPassFragment,
  PostAnimationFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.animation/components/post-animation-form-input"
import { PostAnimationFormUploader } from "~/routes/($lang)._main.new.animation/components/post-animation-form-uploader"
import { postAnimationFormInputReducer } from "~/routes/($lang)._main.new.animation/reducers/post-animation-form-input-reducer"
import { postAnimationFormReducer } from "~/routes/($lang)._main.new.animation/reducers/post-animation-form-reducer"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { useQuery, useMutation } from "@apollo/client/index"
import {
  type MetaFunction,
  useBeforeUnload,
  useLoaderData,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import React from "react"
import { useContext, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import { useTranslation } from "~/hooks/use-translation"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { loaderClient } from "~/lib/loader-client"

export default function NewAnimation () {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [state, dispatch] = useReducer(postAnimationFormReducer, {
    isThumbnailLandscape: false,
    ogpBase64: null,
    progress: 0,
    thumbnailBase64: null,
    thumbnailPosX: 0,
    thumbnailPosY: 0,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile: null,
    isHovered: false,
  })

  const [inputState, dispatchInput] = useReducer(
    postAnimationFormInputReducer,
    {
      accessType: "PUBLIC",
      aiModelId: "1",
      albumId: null,
      caption: "",
      date: new Date(),
      enCaption: "",
      enTitle: "",
      animationStyle: "ILLUSTRATION",
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
    },
  )

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewer } = useQuery(ViewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
  })

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(CreateWorkMutation)

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    thumbnailBase64: state.thumbnailBase64,
  })

  const uploadVideo = async () => {
    if (state.videoFile === null) {
      return null
    }

    const videoUrl = await uploadPublicVideo(
      state.videoFile as File,
      viewer?.viewer?.token,
    )

    return videoUrl
  }

  const onPost = async () => {
    if (formResult.success === false) {
      for (const issue of formResult.issues) {
        toast(issue.message)
        return
      }
      return
    }

    // 動画ファイルとサムネイルの存在チェック
    if (state.videoFile === null) {
      toast(t("動画ファイルを選択してください", "Please select a video file"))
      return
    }

    if (state.thumbnailBase64 === null) {
      toast(
        t(
          "動画のサムネイルが生成されていません。動画ファイルを再選択してください",
          "Video thumbnail not generated. Please reselect the video file",
        ),
      )
      return
    }

    if (
      inputState.reservationDate !== null &&
      inputState.reservationTime === null
    ) {
      toast(
        t(
          "予約投稿の時間を入力してください",
          "Please enter a time for the scheduled post",
        ),
      )
      return
    }

    if (
      inputState.reservationDate === null &&
      inputState.reservationTime !== null
    ) {
      toast(
        t(
          "予約投稿の時間を入力してください",
          "Please enter a time for the scheduled post",
        ),
      )
      return
    }

    const uploadedImageUrls = []

    try {
      dispatch({ type: "SET_PROGRESS", payload: 10 })

      const smallThumbnail = state.isThumbnailLandscape
        ? await resizeImage(formResult.output.thumbnailBase64, 400, 0, "webp")
        : await resizeImage(formResult.output.thumbnailBase64, 0, 400, "webp")

      dispatch({ type: "SET_PROGRESS", payload: 20 })

      const largeThumbnail = state.isThumbnailLandscape
        ? await resizeImage(formResult.output.thumbnailBase64, 600, 0, "webp")
        : await resizeImage(formResult.output.thumbnailBase64, 0, 600, "webp")

      dispatch({ type: "SET_PROGRESS", payload: 30 })

      const thumbnailUrl = await uploadPublicImage(
        formResult.output.thumbnailBase64,
        viewer?.viewer?.token,
      )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(thumbnailUrl)

      const smallThumbnailUrl = await uploadPublicImage(
        smallThumbnail.base64,
        viewer?.viewer?.token,
      )

      dispatch({ type: "SET_PROGRESS", payload: 45 })

      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl = await uploadPublicImage(
        largeThumbnail.base64,
        viewer?.viewer?.token,
      )

      dispatch({ type: "SET_PROGRESS", payload: 50 })

      uploadedImageUrls.push(largeThumbnailUrl)

      const ogpBase64Url = state.ogpBase64
        ? await uploadPublicImage(state.ogpBase64, viewer?.viewer?.token)
        : null

      dispatch({ type: "SET_PROGRESS", payload: 60 })

      if (ogpBase64Url !== null) {
        uploadedImageUrls.push(ogpBase64Url)
      }

      const reservedAt =
        inputState.reservationDate !== null &&
        inputState.reservationTime !== null
          ? new Date(
              `${inputState.reservationDate}T${inputState.reservationTime}`,
            ).getTime() +
            3600000 * 9
          : undefined

      const mainImageSha256 = await sha256(formResult.output.thumbnailBase64)

      const mainImageSize = await getSizeFromBase64(
        formResult.output.thumbnailBase64,
      )

      dispatch({ type: "SET_PROGRESS", payload: 70 })

      const uploadedUrl = await uploadVideo()

      if (!uploadedUrl) {
        toast(
          t("動画のアップロードに失敗しました", "Failed to upload the video"),
        )
        return
      }

      const work = await createWork({
        variables: {
          input: {
            title: formResult.output.title,
            entitle: formResult.output.enTitle,
            explanation: formResult.output.caption,
            enExplanation: formResult.output.enCaption,
            rating: inputState.ratingRestriction,
            prompt: null,
            negativePrompt: null,
            seed: null,
            sampler: null,
            strength: null,
            noise: null,
            modelName: null,
            modelHash: null,
            otherGenerationParams: null,
            pngInfo: null,
            imageStyle: inputState.animationStyle,
            relatedUrl: inputState.link,
            tags: inputState.tags.map((tag) => tag.text),
            isTagEditable: inputState.useTagFeature,
            isCommentEditable: inputState.useCommentFeature,
            thumbnailPosition: state.isThumbnailLandscape
              ? state.thumbnailPosX
              : state.thumbnailPosY,
            modelId: inputState.aiModelId,
            type: "WORK",
            subjectId: inputState.themeId,
            albumId: inputState.albumId,
            isPromotion: inputState.usePromotionFeature,
            reservedAt: reservedAt,
            mainImageSha256: mainImageSha256,
            accessType: inputState.accessType,
            imageUrls: [thumbnailUrl],
            smallThumbnailImageURL: smallThumbnailUrl,
            smallThumbnailImageWidth: smallThumbnail.width,
            smallThumbnailImageHeight: smallThumbnail.height,
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail.width,
            largeThumbnailImageHeight: largeThumbnail.height,
            videoUrl: uploadedUrl,
            ogpImageUrl: ogpBase64Url,
            imageHeight: mainImageSize.height,
            imageWidth: mainImageSize.width,
            accessGenerationType: "PUBLIC",
          },
        },
      })

      if (work.data?.createWork === undefined) {
        toast(t("作品の投稿に失敗しました", "Failed to post the work"))
        return
      }

      dispatch({
        type: "MARK_AS_DONE",
        payload: {
          uploadedWorkId: work.data?.createWork.id,
          uploadedWorkUuid: work.data?.createWork.uuid,
        },
      })

      toast(t("作品を投稿しました", "Work has been posted"))
    } catch (error) {
      console.error("動画投稿エラー:", error)
      if (error instanceof Error) {
        toast(error.message)
      } else {
        toast(t("動画の投稿に失敗しました", "Failed to post video"))
      }
      const promises = uploadedImageUrls.map((url) => {
        return deleteUploadedImage(url)
      })
      await Promise.all(promises)
      // プログレスをリセットする前に少し待機してユーザーがエラーメッセージを確認できるようにする
      setTimeout(() => {
        dispatch({ type: "SET_PROGRESS", payload: 0 })
      }, 3000)
    }
  }

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (state) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Changes will be lost if you navigate away. Is that okay?",
          )
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [state, t],
    ),
  )

  if (data === null) {
    return null
  }

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <div className="space-y-4">
        <div>
          <PostFormHeader type="animation" />
          <PostAnimationFormUploader state={state} dispatch={dispatch} />
        </div>
        <PostAnimationFormInput
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
          recentlyUsedTags={viewer?.viewer?.recentlyUsedTags ?? []}
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
          events={viewer?.appEvents ?? []}
          needFix={false}
        />
        <div className="h-4" />
        <Button
          className="fixed bottom-0 left-0 z-60 ml-0 w-full rounded-none p-0 md:ml-[72px] md:pr-[72px] lg:ml-[224px] lg:pr-[224px] xl:left-auto xl:m-0 xl:max-w-[1200px] xl:pl-[8%]"
          size={"lg"}
          type="submit"
          onClick={onPost}
        >
          {t("投稿", "Post")}
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
      />
    </div>
  )
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_ANIMATION, undefined, props.params.lang)
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
      ownerUserId: "-1",
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
  // 設定画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

const ViewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID,
    $startDate: String!,
    $endDate: String!,
    $startAt: String!,
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostAnimationFormPass
      }
      recentlyUsedTags {
        ...PostAnimationFormRecentlyUsedTags
      }
    }
    albums(
      offset: $offset,
      limit: $limit,
      where: {
        ownerUserId: $ownerUserId,
        needInspected: false,
        needsThumbnailImage: false,
      }
    ) {
      ...PostAnimationFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostAnimationFormAiModel
    }
    dailyThemes(
      limit: 8,
      offset: 0,
      where: {
        startDate: $startDate,
        endDate: $endDate,
      }) {
      id
      title
      dateText
    }
    appEvents(
      limit: 8,
      offset: 0,
      where: {
        endAt: $startAt,
      }
    ) {
      id
      description
      title
      tag
      slug
      endAt
    }
  }`,
  [
    PostAnimationFormAiModelFragment,
    PostAnimationFormAlbumFragment,
    PostAnimationFormPassFragment,
    PostAnimationFormRecentlyUsedTagsFragment,
  ],
)

const CreateWorkMutation = graphql(
  `mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      id
      title
      accessType
      nanoid
      uuid
    }
  }`,
)
