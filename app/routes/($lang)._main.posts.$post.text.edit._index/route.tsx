import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useReducer, useState } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useBeforeUnload, useLoaderData } from "@remix-run/react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import React from "react"
import { EditTextFormUploader } from "~/routes/($lang)._main.posts.$post.text.edit._index/components/edit-text-form-uploader"
import { postTextFormInputReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-input-reducer"
import {
  PostTextFormAiModelFragment,
  PostTextFormAlbumFragment,
  PostTextFormInput,
  PostTextFormPassFragment,
  PostTextFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-text-form-input"
import { postTextFormReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-reducer"
import { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"
import { getJstDate } from "~/utils/jst-date"
import { uploadTextFile } from "~/utils/upload-text-file"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  return {
    id: props.params.post,
  }
}

export const headers: HeadersFunction = () => ({
  // 編集画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

function getReservationDetails(createdAt: number) {
  // 現在時刻よりも未来の時刻なら予約更新の日付と時間をセット
  if (createdAt) {
    const reservedDate = new Date(createdAt * 1000 + 3600000 * 9) // 日本時間に変換
    const now = new Date(Date.now() + 3600000 * 9) // 日本時間の現在時刻

    if (reservedDate > now) {
      const reservationDate = reservedDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "-")
      const reservationTime = reservedDate.toISOString().slice(11, 16)

      return {
        reservationDate,
        reservationTime,
      }
    }
  }
  return {
    reservationDate: null,
    reservationTime: null,
  }
}

export default function EditText() {
  const authContext = useContext(AuthContext)

  const data = useLoaderData<typeof loader>()

  const { data: workWithAuth = null } = useQuery(workQuery, {
    skip: authContext.isLoading,
    variables: {
      id: data.id,
    },
  })

  const work = workWithAuth?.work ?? null

  const [markdownContent, setMarkdownContent] = useState<string>("")

  useEffect(() => {
    // マークダウンファイルの URL からマークダウンを取得する
    if (work?.mdUrl) {
      fetch(work?.mdUrl)
        .then((res) => res.text())
        .then((text) => {
          setMarkdownContent(text)
        })
        .catch((err) => console.error("Error fetching markdown file:", err))
    }
  }, [work?.mdUrl])

  useEffect(() => {
    if (work) {
      dispatch({
        type: "INITIALIZE",
        payload: {
          items: [
            {
              id: 0,
              content: work?.imageURL ?? "",
            },
            ...(work?.subWorks ?? []).map((subWork, index) => ({
              id: index + 1,
              content: subWork.imageUrl ?? "",
            })),
          ],
          indexList: [],
          isThumbnailLandscape:
            (work?.smallThumbnailImageWidth ?? 0) >
            (work?.smallThumbnailImageHeight ?? 0),
          thumbnailBase64: work?.largeThumbnailImageURL ?? "",
          ogpBase64: work?.ogpThumbnailImageUrl ?? "",
          pngInfo: {
            src: work?.pngInfo ?? "",
            params: {
              prompt: work?.prompt ?? "",
              negativePrompt: work?.negativePrompt ?? "",
              seed: work?.seed?.toString() ?? "",
              sampler: work?.sampler ?? "",
              strength: work?.strength ?? "",
              noise: work?.noise ?? "",
              model: work?.model ?? "",
              modelHash: work?.modelHash ?? "",
              steps: work?.steps ? work?.steps.toString() : "",
              scale: work?.scale ? work?.scale.toString() : "",
              vae: "",
            },
          },
          thumbnailPosX:
            (work?.smallThumbnailImageWidth ??
            0 > (work?.smallThumbnailImageHeight ?? 0))
              ? (work?.thumbnailImagePosition ?? 0)
              : 0,
          thumbnailPosY:
            (work?.smallThumbnailImageWidth ??
            0 > (work?.smallThumbnailImageHeight ?? 0))
              ? 0
              : (work?.thumbnailImagePosition ?? 0),
        },
      })

      dispatchInput({
        type: "INITIALIZE",
        payload: {
          accessType: work?.accessType ?? "PUBLIC",
          aiModelId: work?.workModelId?.toString() ?? "1",
          albumId: work?.album?.id ?? null,
          caption: work?.description ?? "",
          date: new Date(work?.createdAt * 1000),
          enCaption: work?.enDescription ?? "",
          enTitle: work?.enTitle ?? "",
          imageInformation: {
            params: {
              prompt: work?.prompt ?? "",
              negativePrompt: work?.negativePrompt ?? "",
              seed: work?.seed?.toString() ?? "",
              steps: work?.steps ? work?.steps.toString() : "",
              strength: work?.strength ?? "",
              noise: work?.noise ?? "",
              scale: work?.scale ? work?.scale.toString() : "",
              sampler: work?.sampler ?? "",
              vae: work?.vae ?? "",
              modelHash: work?.modelHash ?? "",
              model: work?.model ?? "",
            },
            src: work?.pngInfo ?? "",
          },
          imageStyle: work?.style ?? "ILLUSTRATION",
          link: work?.relatedUrl ?? "",
          ratingRestriction: work?.rating ?? "G",
          reservationDate: getReservationDetails(work?.createdAt ?? 0)
            .reservationDate,
          reservationTime: getReservationDetails(work?.createdAt ?? 0)
            .reservationTime,
          tags: work?.tagNames.length
            ? work?.tagNames.map((tag) => ({ id: tag, text: tag }))
            : [],
          themeId: work?.dailyTheme?.id ?? null,
          title: work?.title ?? "",
          useCommentFeature: work?.isCommentsEditable ?? true,
          useGenerationParams: work?.promptAccessType === "PUBLIC",
          usePromotionFeature: work?.isPromotion ?? false,
          useTagFeature: work?.isTagEditable ?? true,
          md: markdownContent ?? "",
          type: work?.type as "COLUMN" | "NOVEL" | "VIDEO" | "WORK",
        },
      })
    }
  }, [work])

  const [state, dispatch] = useReducer(postTextFormReducer, {
    editTargetImageBase64: null,
    indexList: [],
    isDrawing: false,
    isHovered: false,
    isOpenImageGenerationDialog: false,
    isSelectedGenerationImage: false,
    isThumbnailLandscape:
      (work?.smallThumbnailImageWidth ?? 0) >
      (work?.smallThumbnailImageHeight ?? 0),
    items: [
      {
        id: 0,
        content: work?.imageURL ?? "",
      },
      ...(work?.subWorks ?? []).map((subWork, index) => ({
        id: index + 1,
        content: subWork.imageUrl ?? "",
      })),
    ],
    ogpBase64: work?.ogpThumbnailImageUrl ?? "",
    pngInfo: {
      src: work?.pngInfo ?? "",
      params: {
        prompt: work?.prompt ?? "",
        negativePrompt: work?.negativePrompt ?? "",
        seed: work?.seed?.toString() ?? "",
        sampler: work?.sampler ?? "",
        strength: work?.strength ?? "",
        noise: work?.noise ?? "",
        model: work?.model ?? "",
        modelHash: work?.modelHash ?? "",
        steps: work?.steps ? work?.steps.toString() : "",
        scale: work?.scale ? work?.scale.toString() : "",
        vae: "",
      },
    },
    progress: 0,
    selectedImageGenerationIds: [],
    thumbnailBase64: work?.largeThumbnailImageURL ?? "",
    thumbnailPosX:
      (work?.smallThumbnailImageWidth ??
      0 > (work?.smallThumbnailImageHeight ?? 0))
        ? (work?.thumbnailImagePosition ?? 0)
        : 0,
    thumbnailPosY:
      (work?.smallThumbnailImageWidth ??
      0 > (work?.smallThumbnailImageHeight ?? 0) ??
      0)
        ? 0
        : (work?.thumbnailImagePosition ?? 0),
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile: null,
    isOpenLoadingAi: false,
  })

  const { reservationDate, reservationTime } = getReservationDetails(
    work?.createdAt ?? 0,
  )

  const [inputState, dispatchInput] = useReducer(postTextFormInputReducer, {
    accessType: work?.accessType ?? "PUBLIC",
    generationParamAccessType:
      work?.promptAccessType === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    aiModelId: work?.workModelId?.toString() ?? null,
    albumId: work?.album?.id ?? null,
    caption: work?.description ?? "",
    date: new Date(work?.createdAt ?? new Date()),
    enCaption: work?.enDescription ?? "",
    enTitle: work?.enTitle ?? "",
    imageInformation: {
      params: {
        prompt: work?.prompt ?? "",
        negativePrompt: work?.negativePrompt ?? "",
        seed: work?.seed?.toString() ?? "",
        steps: work?.steps ? work?.steps.toString() : "",
        strength: work?.strength ?? "",
        noise: work?.noise ?? "",
        scale: work?.scale ? work?.scale.toString() : "",
        sampler: work?.sampler ?? "",
        vae: work?.vae ?? "",
        modelHash: work?.modelHash ?? "",
        model: work?.model ?? "",
      },
      src: work?.pngInfo ?? "",
    },
    imageStyle: work?.style ?? "ILLUSTRATION",
    link: work?.relatedUrl ?? "",
    ratingRestriction: work?.rating ?? "G",
    reservationDate: reservationDate,
    reservationTime: reservationTime,
    tags: work?.tagNames.length
      ? work?.tagNames.map((tag) => ({ id: tag, text: tag }))
      : [],
    themeId: work?.dailyTheme?.id ?? null,
    title: work?.title ?? "",
    useCommentFeature:
      work?.isCommentsEditable === undefined ? true : work?.isCommentsEditable,
    useGenerationParams: work?.promptAccessType === "PUBLIC",
    usePromotionFeature:
      work?.isPromotion === undefined ? false : work?.isPromotion,
    useTagFeature:
      work?.isTagEditable === undefined ? true : work?.isTagEditable,
    md: markdownContent ?? "",
    type: work?.type as "COLUMN" | "NOVEL" | "VIDEO" | "WORK",
    correctionMessage: "",
  })

  const now = getJstDate(new Date())

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      startAt: now.toISOString().split("T")[0],
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  })

  const [updateWork, { loading: isUpdatedLoading }] =
    useMutation(updateWorkMutation)

  const formResult = safeParse(vPostTextForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
    md: inputState.md,
  })

  const uploadImages = async () => {
    if (authContext.userId === null) {
      return []
    }

    const images = state.items.map((item) => item.content)

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        if (!image) {
          return null
        }
        const imageUrl = image.startsWith("https://")
          ? image
          : await uploadPublicImage(image, viewer?.viewer?.token)
        return imageUrl
      }),
    )

    return imageUrls
  }

  const onPost = async () => {
    if (work === null) {
      return
    }

    if (formResult.success === false) {
      for (const issue of formResult.issues) {
        toast(issue.message)
        return
      }
      return
    }

    if (
      !inputState.correctionMessage &&
      work?.moderatorReport?.status === "UNHANDLED"
    ) {
      toast("修正メッセージを入力してください")
      return
    }

    if (
      inputState.reservationDate !== null &&
      inputState.reservationTime === null
    ) {
      toast("予約投稿の時間を入力してください")
      return
    }

    if (
      inputState.reservationDate === null &&
      inputState.reservationTime !== null
    ) {
      toast("予約投稿の時間を入力してください")
      return
    }

    const uploadedImageUrls = []

    try {
      dispatch({ type: "SET_PROGRESS", payload: 10 })

      const smallThumbnail = formResult.output.thumbnailBase64.startsWith(
        "https://",
      )
        ? null
        : state.isThumbnailLandscape
          ? await resizeImage(formResult.output.thumbnailBase64, 400, 0, "webp")
          : await resizeImage(formResult.output.thumbnailBase64, 0, 400, "webp")

      dispatch({ type: "SET_PROGRESS", payload: 20 })

      const largeThumbnail = formResult.output.thumbnailBase64.startsWith(
        "https://",
      )
        ? null
        : state.isThumbnailLandscape
          ? await resizeImage(formResult.output.thumbnailBase64, 600, 0, "webp")
          : await resizeImage(formResult.output.thumbnailBase64, 0, 600, "webp")

      dispatch({ type: "SET_PROGRESS", payload: 30 })

      const smallThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        smallThumbnail === null
          ? (work.smallThumbnailImageURL ?? "")
          : await uploadPublicImage(
              smallThumbnail.base64,
              viewer?.viewer?.token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        largeThumbnail === null
          ? (work.largeThumbnailImageURL ?? "")
          : await uploadPublicImage(
              largeThumbnail.base64,
              viewer?.viewer?.token,
            )

      uploadedImageUrls.push(largeThumbnailUrl)

      dispatch({ type: "SET_PROGRESS", payload: 50 })

      uploadedImageUrls.push(largeThumbnailUrl)

      const ogpBase64Url =
        state.ogpBase64 === "" || state.ogpBase64?.startsWith("https://")
          ? work.ogpThumbnailImageUrl
          : await uploadPublicImage(
              state.ogpBase64 ?? "",
              viewer?.viewer?.token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 60 })

      if (ogpBase64Url !== null && ogpBase64Url !== "") {
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

      if (work.mdUrl !== "") {
        await uploadTextFile(
          inputState.md,
          "md",
          viewer?.viewer?.token,
          work.mdUrl,
        )
      }

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast("画像の取得に失敗しました")
        return
      }

      const updatedWork = await updateWork({
        variables: {
          input: {
            id: work?.id,
            title: formResult.output.title,
            entitle: formResult.output.enTitle,
            explanation: formResult.output.caption,
            enExplanation: formResult.output.enCaption,
            rating: inputState.ratingRestriction,
            prompt: state.pngInfo?.params.prompt ?? null,
            negativePrompt: state.pngInfo?.params.negativePrompt ?? null,
            seed: state.pngInfo?.params.seed ?? null,
            sampler: state.pngInfo?.params.sampler ?? null,
            strength: state.pngInfo?.params.strength ?? null,
            noise: state.pngInfo?.params.noise ?? null,
            modelName: state.pngInfo?.params.model ?? null,
            modelHash: state.pngInfo?.params.modelHash ?? null,
            otherGenerationParams: state.pngInfo?.src ?? null,
            pngInfo: state.pngInfo?.src ?? null,
            imageStyle: inputState.imageStyle,
            relatedUrl: inputState.link,
            tags: inputState.tags.map((tag) => tag.text),
            isTagEditable: inputState.useTagFeature,
            isCommentEditable: inputState.useCommentFeature,
            thumbnailPosition: state.isThumbnailLandscape
              ? state.thumbnailPosX
              : state.thumbnailPosY,
            modelId: inputState.aiModelId,
            type: inputState.type ?? "COLUMN",
            subjectId: inputState.themeId,
            albumId: inputState.albumId,
            isPromotion: inputState.usePromotionFeature,
            reservedAt: reservedAt,
            mainImageSha256: mainImageSha256,
            accessType: inputState.accessType,
            imageUrls: imageUrls,
            smallThumbnailImageURL: smallThumbnailUrl,
            smallThumbnailImageWidth: smallThumbnail
              ? smallThumbnail.width
              : (work.smallThumbnailImageWidth ?? 0),
            smallThumbnailImageHeight: smallThumbnail
              ? smallThumbnail.height
              : (work.smallThumbnailImageHeight ?? 0),
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail
              ? largeThumbnail.width
              : (work.largeThumbnailImageWidth ?? 0),
            largeThumbnailImageHeight: largeThumbnail
              ? largeThumbnail.height
              : (work.largeThumbnailImageHeight ?? 0),
            videoUrl: null,
            ogpImageUrl: ogpBase64Url,
            imageHeight: mainImageSize.height,
            imageWidth: mainImageSize.width,
            accessGenerationType:
              state.isSelectedGenerationImage && inputState.useGenerationParams
                ? "PUBLIC_RESTORABLE"
                : inputState.useGenerationParams
                  ? "PUBLIC"
                  : "PRIVATE",
            correctionMessage:
              work?.moderatorReport?.status === "UNHANDLED"
                ? inputState.correctionMessage
                : undefined,
          },
        },
      })

      if (updatedWork?.data?.updateWork === undefined) {
        toast("作品の更新に失敗しました")
        return
      }

      dispatch({
        type: "MARK_AS_DONE",
        payload: {
          uploadedWorkId: updatedWork?.data?.updateWork.id,
          uploadedWorkUuid: updatedWork?.data?.updateWork.uuid,
        },
      })

      toast("作品を投稿しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      const promises = uploadedImageUrls.map((url) => {
        return deleteUploadedImage(url)
      })
      await Promise.all(promises)
      dispatch({ type: "SET_PROGRESS", payload: 0 })
    }
  }

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  const [disabledSubmit, setDisabledSubmit] = React.useState(false)

  useBeforeUnload(
    React.useCallback(
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

  return work?.user !== null && work?.user.id === authContext.userId ? (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <div className="space-y-4">
        <EditTextFormUploader state={state} dispatch={dispatch} />
        <PostTextFormInput
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
          events={viewer?.appEvents ?? []}
          needFix={work?.moderatorReport?.status === "UNHANDLED"}
          mdUrl={work?.mdUrl ?? ""}
        />
        <div className="h-4" />
        <Button
          disabled={disabledSubmit}
          className="fixed bottom-0 left-0 z-60 ml-0 w-full rounded-none p-0 md:ml-[72px] md:pr-[72px] lg:ml-[224px] lg:pr-[224px] xl:left-auto xl:m-0 xl:max-w-[1200px] xl:pl-[8%]"
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

const viewerQuery = graphql(
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
        id
        ...PostTextFormPass
      }
      recentlyUsedTags {
        ...PostTextFormRecentlyUsedTags
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
      ...PostTextFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      ...PostTextFormAiModel
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
    PostTextFormAiModelFragment,
    PostTextFormAlbumFragment,
    PostTextFormPassFragment,
    PostTextFormRecentlyUsedTagsFragment,
  ],
)

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      uuid
      isMyRecommended
      title
      accessType
      type
      promptAccessType
      rating
      description
      isSensitive
      enTitle
      enDescription
      imageURL
      largeThumbnailImageURL
      largeThumbnailImageWidth
      largeThumbnailImageHeight
      smallThumbnailImageURL
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      thumbnailImagePosition
      subWorksCount
      ogpThumbnailImageUrl
      tagNames
      createdAt
      model
      modelHash
      generationModelId
      workModelId
      isTagEditable
      isCommentsEditable
      isPromotion
      isGeneration
      ogpThumbnailImageUrl
      prompt
      negativePrompt
      noise
      seed
      steps
      sampler
      scale
      strength
      vae
      clipSkip
      otherGenerationParams
      pngInfo
      style
      url
      relatedUrl
      mdUrl
      user {
        id
        works(offset: 0, limit: 16) {
          id
          userId
          largeThumbnailImageURL
          largeThumbnailImageWidth
          largeThumbnailImageHeight
          smallThumbnailImageURL
          smallThumbnailImageWidth
          smallThumbnailImageHeight
          thumbnailImagePosition
          subWorksCount
        }
      }
      album {
        id
      }
      dailyTheme {
        id
        title
      }
      subWorks {
        id
        imageUrl
      }
      moderatorReport {
        status
        reportMessage
      }
    }
  }`,
)

const updateWorkMutation = graphql(
  `mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
      rating
      accessType
      nanoid
      uuid
    }
  }`,
)
