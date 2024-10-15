import { ConstructionAlert } from "~/components/construction-alert"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import {
  PostTextFormAiModelFragment,
  PostTextFormAlbumFragment,
  PostTextFormInput,
  PostTextFormPassFragment,
} from "~/routes/($lang)._main.new.image/components/post-text-form-input"
import { PostTextFormUploader } from "~/routes/($lang)._main.new.image/components/post-text-form-uploader"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"
import { postTextFormInputReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-input-reducer"
import { postTextFormReducer } from "~/routes/($lang)._main.new.text/reducers/post-text-form-reducer"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import { useQuery, useMutation } from "@apollo/client/index"
import {
  type MetaFunction,
  useBeforeUnload,
  useSearchParams,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import React, { useEffect } from "react"
import { useContext, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import { useTranslation } from "~/hooks/use-translation"
import type { LoaderFunctionArgs } from "react-router-dom"
import { uploadTextFile } from "~/utils/upload-text-file"
import type { HeadersFunction } from "@remix-run/cloudflare"

export default function NewText() {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [searchParams] = useSearchParams()

  const ref = searchParams.get("generation")

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      generationLimit: 64,
      generationOffset: 0,
      generationWhere: {
        nanoids: ref?.split("|") ?? [],
      },
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
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

  useEffect(() => {
    const processImages = async () => {
      if (viewer?.viewer?.imageGenerationResults) {
        const base64Urls = await Promise.all(
          viewer.viewer.imageGenerationResults
            .map((result) =>
              result.imageUrl ? createBase64FromImageURL(result.imageUrl) : "",
            )
            .filter((url) => url !== ""),
        )

        dispatch({
          type: "SET_ITEMS",
          payload: viewer.viewer.imageGenerationResults.map(
            (result, index) => ({
              id: index + 1,
              content: base64Urls[index],
            }),
          ),
        })

        dispatch({
          type: "SET_THUMBNAIL_BASE64",
          payload: base64Urls[0],
        })

        dispatch({
          type: "SET_PNG_INFO",
          payload: {
            src: null,
            params: {
              prompt: viewer.viewer.imageGenerationResults[0].prompt,
              negativePrompt:
                viewer.viewer.imageGenerationResults[0].negativePrompt,
              seed: viewer.viewer.imageGenerationResults[0].seed.toString(),
              sampler: viewer.viewer.imageGenerationResults[0].sampler,
              strength: "",
              noise: "",
              model: viewer.viewer.imageGenerationResults[0].model?.name,
              modelHash: viewer.viewer.imageGenerationResults[0].model?.id,
              steps: viewer.viewer.imageGenerationResults[0].steps.toString(),
              scale: viewer.viewer.imageGenerationResults[0].scale.toString(),
              vae: "",
            },
          },
        })

        dispatch({
          type: "IS_SELECTED_GENERATION_IMAGE",
          payload: true,
        })
      }
    }

    processImages()
  }, [viewer?.viewer?.imageGenerationResults, dispatch])

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(CreateWorkMutation)

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
    const uploads = images.map((image) => {
      if (image === null) {
        return null
      }
      return uploadPublicImage(image, viewer?.viewer?.token)
    })
    const imageUrls = await Promise.all(uploads)
    return imageUrls
  }

  const onPost = async () => {
    const url = uploadTextFile(
      inputState.md,
      "md",
      viewer?.viewer?.token,
      "https://text-files.aipictors.com/c09d45d7-c949-4515-b477-d1c17f1dd038",
    )

    if (url === null) {
      toast(t("本文のアップロードに失敗しました", "Failed to upload the text"))
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
      inputState.reservationDate !== null &&
      inputState.reservationTime === null
    ) {
      toast(
        t(
          "予約投稿の時間を入力してください",
          "Please enter the scheduled post time",
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
          "Please enter the scheduled post time",
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

      const smallThumbnailUrl = await uploadPublicImage(
        smallThumbnail.base64,
        viewer?.viewer?.token,
      )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

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

      const textFile = await uploadTextFile(
        inputState.md,
        "md",
        viewer?.viewer?.token,
      )

      if (textFile === null) {
        toast(
          t("本文のアップロードに失敗しました", "Failed to upload the text"),
        )
        return
      }

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast(t("画像のアップロードに失敗しました", "Failed to upload images"))
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
            smallThumbnailImageWidth: smallThumbnail.width,
            smallThumbnailImageHeight: smallThumbnail.height,
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail.width,
            largeThumbnailImageHeight: largeThumbnail.height,
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
            mdUrl: textFile,
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

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (state) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure to leave this page? Changes may be lost.",
          )
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [state, t],
    ),
  )

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <ConstructionAlert
        type="WARNING"
        message={t(
          "リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！",
          "The renewed version is under development and may have issues! Please continue to use the old version for stability.",
        )}
        fallbackURL="https://www.aipictors.com/post"
      />
      <div className="space-y-4">
        <div>
          <PostFormHeader type="text" />
          <PostTextFormUploader state={state} dispatch={dispatch} />
        </div>
        <PostTextFormInput
          imageInformation={state.pngInfo}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
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
          event={{
            title: viewer?.appEvents[0]?.title ?? null,
            description: viewer?.appEvents[0]?.description ?? null,
            tag: viewer?.appEvents[0]?.tag ?? null,
            endAt: viewer?.appEvents[0]?.endAt ?? 0,
            slug: viewer?.appEvents[0]?.slug ?? null,
          }}
          needFix={false}
        />
        <div className="h-4" />
        <Button
          className="fixed bottom-0 left-0 w-full rounded-none xl:left-auto xl:max-w-[1200px] xl:rounded-md"
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

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

const viewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID
    $generationOffset: Int!,
    $generationLimit: Int!,
    $generationWhere: ImageGenerationResultsWhereInput,
    $startDate: String!,
    $endDate: String!,
    $startAt: String!,
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostTextFormPass
      }
      imageGenerationResults(offset: $generationOffset, limit: $generationLimit, where: $generationWhere) {
        id
        prompt
        negativePrompt
        seed
        steps
        scale
        sampler
        clipSkip
        sizeType
        t2tImageUrl
        t2tMaskImageUrl
        t2tDenoisingStrengthSize
        t2tInpaintingFillSize
        rating
        completedAt
        isProtected
        generationType
        postModelId
        modelHash
        model {
          id
          name
          type
        }
        vae
        nanoid
        status
        estimatedSeconds
        controlNetControlMode
        controlNetEnabled
        controlNetGuidanceEnd
        controlNetGuidanceStart
        controlNetPixelPerfect
        controlNetProcessorRes
        controlNetResizeMode
        controlNetThresholdA
        controlNetThresholdB
        controlNetWeight
        controlNetModule
        controlNetModel
        controlNetSaveDetectedMap
        controlNetHrOption
        upscaleSize
        imageUrl
        thumbnailUrl
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
      id
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
      limit: 1,
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
