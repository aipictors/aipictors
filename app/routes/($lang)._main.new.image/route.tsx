import React, { useEffect, useReducer, useContext } from "react"
import { useQuery, useMutation } from "@apollo/client/index"
import {
  type MetaFunction,
  useBeforeUnload,
  useSearchParams,
} from "@remix-run/react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { ConstructionAlert } from "~/components/construction-alert"
import { Button } from "~/components/ui/button"
import {
  PostImageFormAiModelFragment,
  PostImageFormAlbumFragment,
  PostImageFormInput,
  PostImageFormPassFragment,
  PostImageFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-image-form-input"
import { PostImageFormUploader } from "~/routes/($lang)._main.new.image/components/post-image-form-uploader"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { postImageFormReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { postImageFormInputReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import {
  getNsfwPredictions,
  type NsfwResults,
} from "~/utils/get-nsfw-predictions"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import {
  getExtractInfoFromBase64,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import type { LoaderFunctionArgs } from "react-router-dom"
import { useTranslation } from "~/hooks/use-translation"
import type { HeadersFunction } from "@remix-run/cloudflare"

export default function NewImage() {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [searchParams] = useSearchParams()
  const ref = searchParams.get("generation")

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewer } = useQuery(ViewerQuery, {
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

  console.log(viewer)

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
  })

  const onChangeImageInformation = (imageInformation: PNGInfo) => {
    dispatchInput({
      type: "SET_IMAGE_INFORMATION",
      payload: imageInformation,
    })
  }

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

        const imageUrl =
          viewer.viewer.imageGenerationResults.length !== 0
            ? viewer.viewer.imageGenerationResults[0].imageUrl
            : null

        if (!imageUrl) {
          return
        }

        const pngInfo = imageUrl
          ? await getExtractInfoFromBase64(imageUrl)
          : null

        if (pngInfo) {
          pngInfo.params.prompt = viewer.viewer.imageGenerationResults[0].prompt
          pngInfo.params.negativePrompt =
            viewer.viewer.imageGenerationResults[0].negativePrompt
        }

        dispatchInput({
          type: "SET_IMAGE_INFORMATION",
          payload: pngInfo,
        })

        dispatchInput({
          type: "SET_AI_MODEL_ID",
          payload:
            viewer.viewer.imageGenerationResults[0].postModelId?.toString() ??
            "",
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

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
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
    if (authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
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

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast(
          t("画像のアップロードに失敗しました", "Failed to upload the images"),
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
            prompt: inputState.imageInformation?.params.prompt ?? null,
            negativePrompt:
              inputState.imageInformation?.params.negativePrompt ?? null,
            seed: inputState.imageInformation?.params.seed ?? null,
            sampler: inputState.imageInformation?.params.sampler ?? null,
            strength: inputState.imageInformation?.params.strength ?? null,
            noise: inputState.imageInformation?.params.noise ?? null,
            modelName: inputState.imageInformation?.params.model ?? null,
            modelHash: inputState.imageInformation?.params.modelHash ?? null,
            otherGenerationParams: null,
            pngInfo: inputState.imageInformation?.src ?? null,
            imageStyle: inputState.imageStyle,
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

  const onInputFiles = async (files: FileList) => {
    dispatch({ type: "OPEN_LOADING_AI", payload: true })

    const fileArray = Array.from(files)

    const results = await Promise.all(
      fileArray.map(async (file) => {
        try {
          const nsfwInfo = await getNsfwPredictions(file)
          return nsfwInfo
        } catch (error) {
          console.error("Error processing NSFW predictions:", error)
          return null
        }
      }),
    )

    const validResults = results.filter(
      (nsfwInfo) => nsfwInfo !== null,
    ) as NsfwResults[]

    const mostSuitableStyle = validResults.reduce(
      (currentStyle, nsfwInfo) => {
        if (nsfwInfo.drawings >= 0.7) {
          return "ILLUSTRATION"
        }
        if (nsfwInfo.drawings >= 0.5) {
          return "SEMI_REAL"
        }
        return "REAL"
      },
      "ILLUSTRATION" as "ILLUSTRATION" | "REAL" | "SEMI_REAL",
    )

    const strictestRating = validResults.reduce(
      (currentRating, nsfwInfo) => {
        const newRating =
          nsfwInfo.hentai >= 0.7
            ? "R18"
            : nsfwInfo.hentai >= 0.05 ||
                nsfwInfo.porn >= 0.5 ||
                nsfwInfo.sexy >= 0.8
              ? "R15"
              : "G"

        if (
          inputState.ratingRestriction === "R18G" ||
          inputState.ratingRestriction === "R18"
        ) {
          return inputState.ratingRestriction
        }

        return newRating === "R18" ||
          (newRating === "R15" && currentRating === "G")
          ? newRating
          : currentRating
      },
      "G" as "G" | "R15" | "R18" | "R18G",
    )

    dispatchInput({ type: "SET_RATING_RESTRICTION", payload: strictestRating })
    dispatchInput({ type: "SET_IMAGE_STYLE", payload: mostSuitableStyle })
    dispatch({ type: "OPEN_LOADING_AI", payload: false })
  }

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (state) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure you want to leave this page? Your changes will be lost.",
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
          "旧版はこちら",
          "The renewed version is under development and may have issues! Some features are being re-released! Please continue to use the old version as is!",
        )}
        fallbackURL="https://legacy.aipictors.com/post"
      />
      <div className="max-w-[1200px] space-y-4">
        {authContext.isNotLoggedIn && (
          <p className="text-center font-bold text-md">
            {t(
              "ログインすると投稿できるようになります",
              "Log in to post your work",
            )}
          </p>
        )}

        <div className="relative">
          <PostFormHeader type="image" />
          {state.isOpenLoadingAi && (
            <div className="absolute top-12 right-2 z-10 flex items-center space-x-2 opacity-80">
              <Loader2Icon className="h-4 w-4 animate-spin text-white" />
              <p className="text-white">
                {t(
                  "AIでテイスト、年齢種別を判定中",
                  "Analyzing the image for style and age restrictions using AI",
                )}
              </p>
            </div>
          )}
          <PostImageFormUploader
            onChangeImageInformation={onChangeImageInformation}
            state={state}
            dispatch={dispatch}
            onInputFiles={onInputFiles}
          />
        </div>
        <PostImageFormInput
          imageInformation={inputState.imageInformation}
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
  return createMeta(META.NEW_IMAGE, undefined, props.params.lang)
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

const ViewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID
    $generationOffset: Int!
    $generationLimit: Int!
    $generationWhere: ImageGenerationResultsWhereInput
    $startAt: String
    $startDate: String
    $endDate: String
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostImageFormPass
      }
      recentlyUsedTags {
        ...PostImageFormRecentlyUsedTags
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
      ...PostImageFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostImageFormAiModel
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
    PostImageFormAiModelFragment,
    PostImageFormAlbumFragment,
    PostImageFormPassFragment,
    PostImageFormRecentlyUsedTagsFragment,
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
