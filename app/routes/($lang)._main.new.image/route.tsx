import { ConstructionAlert } from "@/_components/construction-alert"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { resizeImage } from "@/_utils/resize-image"
import { sha256 } from "@/_utils/sha256"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { PostImageFormInput } from "@/routes/($lang)._main.new.image/_components/post-image-form-input"
import { PostImageFormUploader } from "@/routes/($lang)._main.new.image/_components/post-image-form-uploader"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { postImageFormInputReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { postImageFormReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { vPostImageForm } from "@/routes/($lang)._main.new.image/validations/post-image-form"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"

export default function NewImage() {
  const authContext = useContext(AuthContext)

  const [state, dispatch] = useReducer(postImageFormReducer, {
    editTargetImageBase64: null,
    indexList: [],
    isCreatedWork: false,
    isCreatingWork: false,
    isDrawing: false,
    isHovered: false,
    isOpenImageGenerationDialog: false,
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
  })

  const [inputState, dispatchInput] = useReducer(postImageFormInputReducer, {
    imageInformation: null,
    date: new Date(),
    title: "",
    enTitle: "",
    caption: "",
    enCaption: "",
    themeId: null,
    albumId: null,
    link: "",
    tags: [],
    useTagFeature: false,
    useCommentFeature: false,
    usePromotionFeature: false,
    ratingRestriction: "G",
    accessType: "PUBLIC",
    imageStyle: "ILLUSTRATION",
    aiModelId: "1",
    reservationDate: null,
    reservationTime: null,
    useGenerationParams: true,
  })

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
    },
  })

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(createWorkMutation)

  console.log(inputState)

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
    console.log(formResult)

    if (formResult.success === false) {
      for (const issue of formResult.issues) {
        toast(issue.message)
        return
      }
    }

    if (formResult.success === false) {
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
        toast("画像のアップロードに失敗しました")
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
            otherGenerationParams: null,
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
            smallThumbnailImageWidth: smallThumbnail.width,
            smallThumbnailImageHeight: smallThumbnail.height,
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail.width,
            largeThumbnailImageHeight: largeThumbnail.height,
            videoUrl: null,
            ogpImageUrl: ogpBase64Url,
            imageHeight: mainImageSize.height,
            imageWidth: mainImageSize.width,
            accessGenerationType: inputState.useGenerationParams
              ? "PUBLIC"
              : "PRIVATE",
          },
        },
      })

      if (work.data?.createWork) {
        dispatch({
          type: "SET_UPLOADED_WORK_ID",
          payload: work.data?.createWork.id,
        })
        if (work.data?.createWork.accessType === "LIMITED") {
          dispatch({
            type: "SET_UPLOADED_WORK_UUID",
            payload: work.data?.createWork.uuid ?? null,
          })
        }
      }
      dispatch({ type: "SET_PROGRESS", payload: 100 })
      toast("作品を投稿しました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      const promises = uploadedImageUrls.map((url) => {
        return deleteUploadedImage(url)
      })
      await Promise.all(promises)
    }

    dispatch({ type: "SET_PROGRESS", payload: 0 })
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

  return (
    <div className="space-y-2">
      <ConstructionAlert
        type="WARNING"
        title="試験的にリニューアル版を運用中です。"
        fallbackURL="https://www.aipictors.com/post"
      />
      <div className="w-full max-w-[1200px] space-y-4">
        <PostImageFormUploader state={state} dispatch={dispatch} />
        <PostImageFormInput
          imageInformation={state.pngInfo}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
        />
        <Button size={"lg"} className="w-full" type="submit" onClick={onPost}>
          {"投稿"}
        </Button>
      </div>
      <SuccessCreatedWorkDialog
        isOpen={state.isCreatedWork}
        title={inputState.title}
        imageBase64={state.thumbnailBase64}
        workId={state.uploadedWorkId}
        uuid={state.uploadedWorkUuid}
        shareTags={["Aipictors", "AIイラスト", "AIart"]}
        createdAt={createdAt.getTime()}
      />
      <CreatingWorkDialog
        progress={state.progress}
        isOpen={state.isCreatingWork}
      />
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

const createWorkMutation = graphql(
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
