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
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { vPostImageForm } from "@/routes/($lang)._main.new.image/validations/post-image-form"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useReducer } from "react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useBeforeUnload, useLoaderData } from "@remix-run/react"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { EditAnimationFormUploader } from "@/routes/($lang)._main.posts.$post.animation.edit._index/_components/edit-animation-form-uploader"
import { postAnimationFormReducer } from "@/routes/($lang)._main.new.animation/reducers/post-animation-form-reducer"
import { PostAnimationFormInput } from "@/routes/($lang)._main.new.animation/_components/post-animation-form-input"
import { postAnimationFormInputReducer } from "@/routes/($lang)._main.new.animation/reducers/post-animation-form-input-reducer"
import React from "react"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.post === undefined) {
    throw new Response(null, { status: 404 })
  }

  return json({
    id: props.params.post,
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

export default function EditImage() {
  const authContext = useContext(AuthContext)

  const data = useLoaderData<typeof loader>()

  const { data: workWithAuth = null } = useQuery(workQuery, {
    skip: authContext.isLoading,
    variables: {
      id: data.id,
    },
  })

  const work = workWithAuth?.work ?? null

  useEffect(() => {
    if (work) {
      dispatch({
        type: "INITIALIZE",
        payload: {
          thumbnailBase64: work?.largeThumbnailImageURL ?? "",
          videoFile: null,
          ogpBase64: work?.ogpThumbnailImageUrl ?? "",
          thumbnailPosX:
            work?.smallThumbnailImageWidth ??
            0 > (work?.smallThumbnailImageHeight ?? 0)
              ? work?.thumbnailImagePosition ?? 0
              : 0,
          thumbnailPosY:
            work?.smallThumbnailImageWidth ??
            0 > (work?.smallThumbnailImageHeight ?? 0)
              ? 0
              : work?.thumbnailImagePosition ?? 0,
          isThumbnailLandscape:
            (work?.smallThumbnailImageWidth ?? 0) >
            (work?.smallThumbnailImageHeight ?? 0),
          progress: 0,
          uploadedWorkId: work?.id,
          uploadedWorkUuid: work?.uuid,
        },
      })

      console.log(work)

      dispatchInput({
        type: "INITIALIZE",
        payload: {
          accessType: work?.accessType ?? "PUBLIC",
          aiModelId: work?.workModelId?.toString() ?? "1",
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
          reservationDate: getReservationDetails(work?.createdAt ?? 0)
            .reservationDate,
          reservationTime: getReservationDetails(work?.createdAt ?? 0)
            .reservationTime,
          tags: work?.tagNames.length
            ? work?.tagNames.map((tag) => ({ id: tag, text: tag }))
            : [],
          themeId: work?.dailyTheme?.id ?? null,
          title: work?.title ?? "",
          useCommentFeature:
            work?.isCommentsEditable === undefined
              ? true
              : work?.isCommentsEditable,
          useGenerationParams: work?.promptAccessType === "PUBLIC",
          usePromotionFeature:
            work?.isPromotion === undefined ? false : work?.isPromotion,
          useTagFeature:
            work?.isTagEditable === undefined ? true : work?.isTagEditable,
        },
      })
    }
  }, [work])

  const [state, dispatch] = useReducer(postAnimationFormReducer, {
    isHovered: false,
    isThumbnailLandscape:
      (work?.smallThumbnailImageWidth ?? 0) >
      (work?.smallThumbnailImageHeight ?? 0),
    ogpBase64: work?.ogpThumbnailImageUrl ?? "",
    progress: 0,
    thumbnailBase64: work?.largeThumbnailImageURL ?? "",
    thumbnailPosX:
      work?.smallThumbnailImageWidth ??
      0 > (work?.smallThumbnailImageHeight ?? 0)
        ? work?.thumbnailImagePosition ?? 0
        : 0,
    thumbnailPosY:
      work?.smallThumbnailImageWidth ??
      0 > (work?.smallThumbnailImageHeight ?? 0) ??
      0
        ? 0
        : work?.thumbnailImagePosition ?? 0,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile:
      typeof work?.url === "string"
        ? {
            type: "video/mp4",
            name: "video.mp4",
            lastModified: 0,
            size: 0,
            webkitRelativePath: "",
          }
        : null,
  })

  const { reservationDate, reservationTime } = getReservationDetails(
    work?.createdAt ?? 0,
  )

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
    },
  })

  const [updateWork, { loading: isUpdatedLoading }] =
    useMutation(updateWorkMutation)

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    thumbnailBase64: state.thumbnailBase64,
  })

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
          ? work.smallThumbnailImageURL ?? ""
          : await uploadPublicImage(
              smallThumbnail.base64,
              viewer?.viewer?.token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        largeThumbnail === null
          ? work.largeThumbnailImageURL ?? ""
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

      const updatedWork = await updateWork({
        variables: {
          input: {
            id: work?.id,
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
            imageStyle: work?.style,
            relatedUrl: inputState.link,
            tags: inputState.tags.map((tag) => tag.text),
            isTagEditable: inputState.useTagFeature,
            isCommentEditable: inputState.useCommentFeature,
            thumbnailPosition: state.isThumbnailLandscape
              ? state.thumbnailPosX
              : state.thumbnailPosY,
            modelId: inputState.aiModelId,
            type: "VIDEO",
            subjectId: inputState.themeId,
            albumId: inputState.albumId,
            isPromotion: inputState.usePromotionFeature,
            reservedAt: reservedAt,
            mainImageSha256: mainImageSha256,
            accessType: inputState.accessType,
            imageUrls: [largeThumbnailUrl],
            smallThumbnailImageURL: smallThumbnailUrl,
            smallThumbnailImageWidth: smallThumbnail
              ? smallThumbnail.width
              : work.smallThumbnailImageWidth ?? 0,
            smallThumbnailImageHeight: smallThumbnail
              ? smallThumbnail.height
              : work.smallThumbnailImageHeight ?? 0,
            largeThumbnailImageURL: largeThumbnailUrl,
            largeThumbnailImageWidth: largeThumbnail
              ? largeThumbnail.width
              : work.largeThumbnailImageWidth ?? 0,
            largeThumbnailImageHeight: largeThumbnail
              ? largeThumbnail.height
              : work.largeThumbnailImageHeight ?? 0,
            videoUrl: work?.url ?? "",
            ogpImageUrl: ogpBase64Url,
            imageHeight: mainImageSize.height,
            imageWidth: mainImageSize.width,
            accessGenerationType: "PUBLIC",
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
          uploadedWorkUuid:
            inputState.accessType !== "PRIVATE"
              ? null
              : updatedWork?.data?.updateWork.uuid ?? null,
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

  return work?.user.id === authContext.userId ? (
    <div className="m-auto w-full max-w-[1200px] space-y-4 pb-4">
      <ConstructionAlert
        type="WARNING"
        message="このページは現在開発中のため不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/post"
      />
      <div className="space-y-4">
        <EditAnimationFormUploader
          state={state}
          dispatch={dispatch}
          previewVideoUrl={work?.url ?? ""}
        />
        <PostAnimationFormInput
          state={inputState}
          dispatch={dispatchInput}
          albums={viewer?.albums ?? []}
          currentPass={viewer?.viewer?.currentPass ?? null}
          eventInputHidden={false}
          setDisabledSubmit={setDisabledSubmit}
        />
        <Button
          disabled={disabledSubmit}
          size={"lg"}
          className="w-full"
          type="submit"
          onClick={onPost}
        >
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
      uuid
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
