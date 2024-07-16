import { ConstructionAlert } from "@/_components/construction-alert"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { subWorkFieldsFragment } from "@/_graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "@/_graphql/fragments/user-fields"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { resizeImage } from "@/_utils/resize-image"
import { sha256 } from "@/_utils/sha256"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { PostImageFormInput } from "@/routes/($lang)._main.new.image/_components/post-image-form-input"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { postImageFormInputReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { postImageFormReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { vPostImageForm } from "@/routes/($lang)._main.new.image/validations/post-image-form"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { EditImageFormUploader } from "@/routes/($lang)._main.posts.$post.edit._index/_components/edit-image-form-uploader"
import { createClient } from "@/_lib/client"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const workResp = await client.query({
    query: workQuery,
    variables: {
      id: props.params.post,
    },
  })

  if (workResp.data.work === null) {
    throw new Response("Not found", { status: 404 })
  }

  return json({
    work: workResp.data.work,
  })
}

function getReservationDetails(createdAt: number) {
  // 現在時刻よりも未来の時刻なら予約更新の日付と時間をセット
  if (createdAt) {
    const reservedDate = new Date(createdAt * 1000 + 3600000 * 9) // 日本時間に変換
    const now = new Date(Date.now() + 3600000 * 9) // 日本時間の現在時刻

    if (reservedDate > now) {
      const reservationDate = reservedDate
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "/")
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

export default function EditImage() {
  const authContext = useContext(AuthContext)

  const data = useLoaderData<typeof loader>()

  const [state, dispatch] = useReducer(postImageFormReducer, {
    editTargetImageBase64: null,
    indexList: [],
    isDrawing: false,
    isHovered: false,
    isOpenImageGenerationDialog: false,
    isSelectedGenerationImage: false,
    isThumbnailLandscape:
      (data.work.smallThumbnailImageWidth ?? 0) >
      (data.work.smallThumbnailImageHeight ?? 0),
    items: [
      {
        id: 0,
        content: data.work.imageURL ?? "",
      },
      ...(data.work.subWorks ?? []).map((subWork, index) => ({
        id: index + 1,
        content: subWork.imageUrl ?? "",
      })),
    ],
    ogpBase64: data.work.ogpThumbnailImageUrl ?? "",
    pngInfo: {
      src: data.work.pngInfo ?? "",
      params: {
        prompt: data.work.prompt ?? "",
        negativePrompt: data.work.negativePrompt ?? "",
        seed: data.work.seed?.toString() ?? "",
        sampler: data.work.sampler ?? "",
        strength: data.work.strength ?? "",
        noise: data.work.noise ?? "",
        model: data.work.model ?? "",
        modelHash: data.work.modelHash ?? "",
        steps: data.work.steps ? data.work.steps.toString() : "",
        scale: data.work.scale ? data.work.scale.toString() : "",
        vae: "",
      },
    },
    progress: 0,
    selectedImageGenerationIds: [],
    thumbnailBase64: data.work.largeThumbnailImageURL ?? "",
    thumbnailPosX:
      data.work.smallThumbnailImageWidth ??
      0 > (data.work.smallThumbnailImageHeight ?? 0)
        ? data.work.thumbnailImagePosition ?? 0
        : 0,
    thumbnailPosY:
      data.work.smallThumbnailImageWidth ??
      0 > (data.work.smallThumbnailImageHeight ?? 0) ??
      0
        ? 0
        : data.work.thumbnailImagePosition ?? 0,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile: null,
  })

  const { reservationDate, reservationTime } = getReservationDetails(
    data.work.createdAt,
  )

  const [inputState, dispatchInput] = useReducer(postImageFormInputReducer, {
    accessType: data.work.accessType,
    generationParamAccessType:
      data.work.promptAccessType === "PUBLIC" ? "PUBLIC" : "PRIVATE",
    aiModelId: data.work.workModelId?.toString() ?? null,
    albumId: data.work.album?.id ?? null,
    caption: data.work.description ?? "",
    date: new Date(data.work.createdAt ?? new Date()),
    enCaption: data.work.enDescription ?? "",
    enTitle: data.work.enTitle ?? "",
    imageInformation: {
      params: {
        prompt: data.work.prompt ?? "",
        negativePrompt: data.work.negativePrompt ?? "",
        seed: data.work.seed?.toString() ?? "",
        steps: data.work.steps ? data.work.steps.toString() : "",
        strength: data.work.strength ?? "",
        noise: data.work.noise ?? "",
        scale: data.work.scale ? data.work.scale.toString() : "",
        sampler: data.work.sampler ?? "",
        vae: data.work.vae ?? "",
        modelHash: data.work.modelHash ?? "",
        model: data.work.model ?? "",
      },
      src: data.work.pngInfo ?? "",
    },
    imageStyle: data.work.style,
    link: data.work.relatedUrl ?? "",
    ratingRestriction: data.work.rating ?? "G",
    reservationDate: reservationDate,
    reservationTime: reservationTime,
    tags: [
      ...(data.work.tagNames[0]
        .split(",")
        .map((tag) => ({ id: tag, text: tag })) ?? []),
    ],
    themeId: data.work.dailyTheme?.id ?? null,
    title: data.work.title ?? "",
    useCommentFeature: data.work.isCommentsEditable ?? true,
    useGenerationParams: data.work.promptAccessType === "PUBLIC",
    usePromotionFeature: data.work.isPromotion ?? false,
    useTagFeature: data.work.isTagEditable ?? true,
  })

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
    },
  })

  const [updateWork, { loading: isUpdatedLoading }] =
    useMutation(updateWorkMutation)

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

      console.log(formResult.output.thumbnailBase64)

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
          ? data.work.smallThumbnailImageURL ?? ""
          : await uploadPublicImage(
              smallThumbnail.base64,
              viewer?.viewer?.token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        largeThumbnail === null
          ? data.work.largeThumbnailImageURL ?? ""
          : await uploadPublicImage(
              largeThumbnail.base64,
              viewer?.viewer?.token,
            )

      uploadedImageUrls.push(largeThumbnailUrl)

      dispatch({ type: "SET_PROGRESS", payload: 50 })

      uploadedImageUrls.push(largeThumbnailUrl)

      const ogpBase64Url =
        state.ogpBase64 === "" || state.ogpBase64?.startsWith("https://")
          ? data.work.ogpThumbnailImageUrl
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

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast("画像の取得に失敗しました")
        return
      }

      const work = await updateWork({
        variables: {
          input: {
            id: data.work.id,
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
            type: "WORK",
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
              : data.work.smallThumbnailImageWidth ?? 0,
            smallThumbnailImageHeight: smallThumbnail
              ? smallThumbnail.height
              : data.work.smallThumbnailImageHeight ?? 0,
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail
              ? largeThumbnail.width
              : data.work.largeThumbnailImageWidth ?? 0,
            largeThumbnailImageHeight: largeThumbnail
              ? largeThumbnail.height
              : data.work.largeThumbnailImageHeight ?? 0,
            videoUrl: null,
            ogpImageUrl: ogpBase64Url,
            imageHeight: mainImageSize.height,
            imageWidth: mainImageSize.width,
            accessGenerationType:
              state.isSelectedGenerationImage && inputState.useGenerationParams
                ? "PUBLIC_IN_OWN_PRODUCT"
                : inputState.useGenerationParams
                  ? "PUBLIC"
                  : "PRIVATE",
          },
        },
      })

      if (work?.data?.updateWork === undefined) {
        toast("作品の更新に失敗しました")
        return
      }

      dispatch({
        type: "MARK_AS_DONE",
        payload: {
          uploadedWorkId: work?.data?.updateWork.id,
          uploadedWorkUuid:
            inputState.accessType !== "PRIVATE"
              ? null
              : work?.data?.updateWork.uuid ?? null,
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

  // TODO_2024_08: 仕組みが分からなかった
  // useBeforeUnload(
  //   React.useCallback(
  //     (event) => {
  //       if (state.state) {
  //         const confirmationMessage =
  //           "ページ遷移すると変更が消えますが問題無いですか？"
  //         event.returnValue = confirmationMessage
  //         return confirmationMessage
  //       }
  //     },
  //     [state.state],
  //   ),
  // )

  return data.work.user.id === authContext.userId ? (
    <div className="m-auto w-full max-w-[1200px] space-y-2">
      <ConstructionAlert
        type="WARNING"
        title="試験的にリニューアル版を運用中です。"
        fallbackURL="https://www.aipictors.com/post"
      />
      <div className="space-y-4">
        <EditImageFormUploader state={state} dispatch={dispatch} />
        <PostImageFormInput
          imageInformation={state.pngInfo}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
        />
        <Button size={"lg"} className="w-full" type="submit" onClick={onPost}>
          {"更新"}
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
    $ownerUserId: ID
  ) {
    viewer {
      id
      token
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
    albums(
      offset: $offset,
      limit: $limit,
      where: {
        ownerUserId: $ownerUserId,
        isSensitiveAndAllRating: true,
        needInspected: false,
        needsThumbnailImage: false,
      }
    ) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }`,
  [partialAlbumFieldsFragment, partialUserFieldsFragment, passFieldsFragment],
)

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      id
      isMyRecommended
      title
      accessType
      type
      adminAccessType
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
      user {
        id
        promptonUser {
          id
        }
        ...UserFields
        isFollower
        isFollowee
        isMuted
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
      likedUsers(offset: 0, limit: 32) {
        id
        name
        iconUrl
        login
      }
      album {
        id
        title
        description
      }
      dailyTheme {
        id
        title
      }
      tagNames
      createdAt
      likesCount
      viewsCount
      commentsCount
      subWorks {
        ...SubWorkFields
      }
      nextWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
      }
      previousWork {
        id
        smallThumbnailImageURL
        smallThumbnailImageWidth
        smallThumbnailImageHeight
        thumbnailImagePosition
      }
      model
      modelHash
      generationModelId
      workModelId
      isTagEditable
      isCommentsEditable
      isLiked
      isBookmarked
      isInCollection
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
      html
      updatedAt
      dailyRanking
      weeklyRanking
      monthlyRanking
      relatedUrl
      nanoid
    }
  }`,
  [userFieldsFragment, subWorkFieldsFragment],
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
