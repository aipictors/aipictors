import { ConstructionAlert } from "~/components/construction-alert"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { partialAlbumFieldsFragment } from "~/graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
import { passFieldsFragment } from "~/graphql/fragments/pass-fields"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { uploadPublicVideo } from "~/utils/upload-public-video"
import { PostAnimationFormInput } from "~/routes/($lang)._main.new.animation/components/post-animation-form-input"
import { PostAnimationFormUploader } from "~/routes/($lang)._main.new.animation/components/post-animation-form-uploader"
import { postAnimationFormInputReducer } from "~/routes/($lang)._main.new.animation/reducers/post-animation-form-input-reducer"
import { postAnimationFormReducer } from "~/routes/($lang)._main.new.animation/reducers/post-animation-form-reducer"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { useQuery, useMutation } from "@apollo/client/index"
import { useBeforeUnload } from "@remix-run/react"
import { graphql } from "gql.tada"
import React from "react"
import { useContext, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { aiModelFieldsFragment } from "~/graphql/fragments/ai-model-fields"

export default function NewAnimation() {
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
    },
  )

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
      startAt: new Date().toISOString().split("T")[0],
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  })

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(createWorkMutation)

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
        toast("動画のアップロードに失敗しました")
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
        toast("作品の投稿に失敗しました")
        return
      }

      dispatch({
        type: "MARK_AS_DONE",
        payload: {
          uploadedWorkId: work.data?.createWork.id,
          uploadedWorkUuid: work.data?.createWork.uuid,
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

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <ConstructionAlert
        type="WARNING"
        message="このページは現在開発中のため不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/post"
      />
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
        />
        <Button size={"lg"} className="w-full" type="submit" onClick={onPost}>
          {"投稿"}
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
    aiModels(offset: 0, limit: 124, where: {}) {
      ...AiModelFields
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
        startAt: $startAt,
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
    aiModelFieldsFragment,
    partialAlbumFieldsFragment,
    partialUserFieldsFragment,
    passFieldsFragment,
  ],
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
