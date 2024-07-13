import { ConstructionAlert } from "@/_components/construction-alert"
import { Button } from "@/_components/ui/button"
import { AuthContext } from "@/_contexts/auth-context"
import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { cn } from "@/_lib/cn"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { getExtractInfoFromPNG } from "@/_utils/get-extract-info-from-png"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { resizeImage } from "@/_utils/resize-image"
import { sha256 } from "@/_utils/sha256"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { uploadPublicVideo } from "@/_utils/upload-public-video"
import { config } from "@/config"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { PostFormItemDraggableImagesAndVideo } from "@/routes/($lang)._main.new.image/_components/post-form-item-draggable-images-and-video"
import { PostFormItemThumbnailPositionAdjust } from "@/routes/($lang)._main.new.image/_components/post-form-item-thumbnail-position-adjust"
import { PostFormOgp } from "@/routes/($lang)._main.new.image/_components/post-form-ogp"
import { PostImageFormInput } from "@/routes/($lang)._main.new.image/_components/post-image-form-input"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { postImageFormInputReducer } from "@/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import {
  postFormReducer,
  type PostImageFormState,
} from "@/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { useQuery, useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useReducer } from "react"
import { toast } from "sonner"

export default function NewImage() {
  const authContext = useContext(AuthContext)

  const [state, dispatch] = useReducer(postFormReducer, {
    pngInfo: null,
    isDrawing: false,
    isHovered: false,
    editTargetImageBase64: null,
    items: [],
    indexList: [],
    videoFile: null,
    thumbnailBase64: null,
    ogpBase64: null,
    thumbnailPosX: 0,
    thumbnailPosY: 0,
    isThumbnailLandscape: false,
    isCreatedWork: false,
    isCreatingWork: false,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    progress: 0,
    selectedImageGenerationIds: [],
    isOpenImageGenerationDialog: false,
  })

  const [inputState, dispatchInput] = useReducer(postImageFormInputReducer, {
    imageInformation: null,
    date: new Date(),
    title: null,
    enTitle: null,
    caption: null,
    enCaption: null,
    themeId: null,
    albumId: null,
    link: null,
    tags: [],
    isTagEditable: false,
    isCommentsEditable: false,
    isPromotion: false,
    ratingRestriction: "G",
    accessType: "PUBLIC",
    imageStyle: "ILLUSTRATION",
    aiModelId: "1",
    reservationDate: null,
    reservationTime: null,
    isSetGenerationParams: true,
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

  const onPost = async () => {
    const uploadedImageUrls = []
    try {
      dispatch({ type: "SET_PROGRESS", payload: 5 })

      if (!authContext || !authContext.userId) {
        toast("ログインしてください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 10 })

      if (inputState.title === null) {
        toast("タイトルを入力してください")
        return
      }
      if (inputState.title.length > 120) {
        toast("タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 15 })

      if (inputState.caption && inputState.caption.length > 3000) {
        toast("キャプションは3000文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 20 })

      if (inputState.enTitle && inputState.enTitle.length > 120) {
        toast("英語タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 25 })

      if (inputState.enCaption && inputState.enCaption.length > 3000) {
        toast("英語キャプションは3000文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 30 })

      if (state.videoFile === null && state.items.length === 0) {
        toast("画像もしくは動画を選択してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 35 })

      if (
        (inputState.reservationDate !== null &&
          inputState.reservationTime === null) ||
        (inputState.reservationDate === null &&
          inputState.reservationTime !== null)
      ) {
        toast("予約投稿の時間を入力してください")
        return
      }

      if (!state.thumbnailBase64) {
        toast("サムネイル画像を設定してください")
        return
      }

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      const smallThumbnail = state.isThumbnailLandscape
        ? await resizeImage(state.thumbnailBase64, 400, 0, "webp")
        : await resizeImage(state.thumbnailBase64, 0, 400, "webp")
      const largeThumbnail = state.isThumbnailLandscape
        ? await resizeImage(state.thumbnailBase64, 600, 0, "webp")
        : await resizeImage(state.thumbnailBase64, 0, 600, "webp")
      dispatch({ type: "SET_PROGRESS", payload: 50 })

      const smallThumbnailUrl = await uploadPublicImage(
        smallThumbnail.base64,
        viewer?.viewer?.token,
      )
      uploadedImageUrls.push(smallThumbnailUrl)
      const largeThumbnailUrl = await uploadPublicImage(
        largeThumbnail.base64,
        viewer?.viewer?.token,
      )
      uploadedImageUrls.push(largeThumbnailUrl)
      const ogpBase64Url = state.ogpBase64
        ? await uploadPublicImage(state.ogpBase64, viewer?.viewer?.token)
        : null
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
      const mainImageSha256 = await sha256(state.thumbnailBase64)
      const mainImageSize = await getSizeFromBase64(state.thumbnailBase64)
      dispatch({ type: "SET_PROGRESS", payload: 60 })

      if (state.videoFile) {
        const uploadVideo = async () => {
          if (authContext.userId === null || state.videoFile === null) {
            return null
          }
          const videoUrl = await uploadPublicVideo(
            state.videoFile as File,
            viewer?.viewer?.token,
          )
          return videoUrl
        }

        const videoUrl = await uploadVideo()
        const work = await createWork({
          variables: {
            input: {
              title: inputState.title,
              entitle: inputState.enTitle,
              explanation: inputState.caption,
              enExplanation: inputState.enCaption,
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
              isTagEditable: inputState.isTagEditable,
              isCommentEditable: inputState.isCommentsEditable,
              thumbnailPosition: state.isThumbnailLandscape
                ? state.thumbnailPosX
                : state.thumbnailPosY,
              modelId: inputState.aiModelId,
              type: "VIDEO",
              subjectId: inputState.themeId,
              albumId: inputState.albumId,
              isPromotion: inputState.isPromotion,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: inputState.accessType,
              imageUrls: [largeThumbnailUrl],
              smallThumbnailImageURL: smallThumbnailUrl,
              smallThumbnailImageWidth: smallThumbnail.width,
              smallThumbnailImageHeight: smallThumbnail.height,
              largeThumbnailImageURL: largeThumbnailUrl,
              largeThumbnailImageWidth: largeThumbnail.width,
              largeThumbnailImageHeight: largeThumbnail.height,
              videoUrl: videoUrl,
              ogpImageUrl: ogpBase64Url,
              imageHeight: mainImageSize.height,
              imageWidth: mainImageSize.width,
              accessGenerationType: inputState.isSetGenerationParams
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
        dispatch({ type: "SET_PROGRESS", payload: 80 })
      }

      if (state.videoFile === null && state.items.length !== 0) {
        const uploadImages = async () => {
          if (authContext.userId === null) {
            return []
          }

          const images = state.items.map((item) => item.content)

          const imageUrls = await Promise.all(
            images.map(async (image) => {
              if (image === null) {
                return null
              }
              const imageUrl = await uploadPublicImage(
                image,
                viewer?.viewer?.token,
              )
              return imageUrl
            }),
          )

          return imageUrls
        }

        const imageUrls = await uploadImages().then((urls) =>
          urls.filter((url) => url !== null),
        )
        if (imageUrls.length === 0) {
          toast("画像のアップロードに失敗しました")
          return
        }
        const work = await createWork({
          variables: {
            input: {
              title: inputState.title,
              entitle: inputState.enTitle,
              explanation: inputState.caption,
              enExplanation: inputState.enCaption,
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
              isTagEditable: inputState.isTagEditable,
              isCommentEditable: inputState.isCommentsEditable,
              thumbnailPosition: state.isThumbnailLandscape
                ? state.thumbnailPosX
                : state.thumbnailPosY,
              modelId: inputState.aiModelId,
              type: "WORK",
              subjectId: inputState.themeId,
              albumId: inputState.albumId,
              isPromotion: inputState.isPromotion,
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
              accessGenerationType: inputState.isSetGenerationParams
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
        dispatch({ type: "SET_PROGRESS", payload: 80 })
      }

      dispatch({ type: "SET_IS_CREATING_WORK", payload: false })
      dispatch({ type: "SET_IS_CREATED_WORK", payload: true })
      toast("作品を投稿しました")
      dispatch({ type: "SET_PROGRESS", payload: 100 })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      const deleteImages = uploadedImageUrls.map((url) => {
        return deleteUploadedImage(url)
      })
      await Promise.all(deleteImages)
      dispatch({ type: "SET_PROGRESS", payload: 0 })
      dispatch({ type: "SET_IS_CREATING_WORK", payload: false })
    } finally {
      dispatch({ type: "SET_PROGRESS", payload: 0 })
      dispatch({ type: "SET_IS_CREATING_WORK", payload: false })
    }
  }

  const onInputPngInfo = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        return
      }
      const pngInfo = await getExtractInfoFromPNG(file)
      if (pngInfo.src !== null) {
        dispatch({
          type: "SET_PNG_INFO",
          payload: pngInfo as PostImageFormState["pngInfo"],
        })
        toast("PNG情報を取得しました")
        return
      }
      dispatch({ type: "SET_PNG_INFO", payload: null })
      toast("PNG情報を取得できませんでした")
    }
    input.click()
  }

  const selectedFilesSizeText = () => {
    const totalBytes = state.items
      .map((item) => item.content)
      .reduce((acc, imageBase64) => {
        if (!imageBase64) {
          return acc
        }
        const byteLength = new TextEncoder().encode(imageBase64).length
        return acc + byteLength
      }, 0)

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    }
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const selectedImagesCountText = () => {
    const imageCount = state.items.filter((item) => item.content).length
    return `イラスト${imageCount}枚`
  }

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  // TODO: あとで
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
      <div className="relative w-[100%]">
        <div className="mb-4 space-y-2 p-1">
          <div>
            <div
              className={cn(
                "relative items-center bg-gray-800",
                state.isHovered && "border-2 border-white border-dashed",
              )}
            >
              {state.items.length !== 0 && (
                <div className="mb-4 bg-gray-600 p-1 pl-4 dark:bg-blend-darken">
                  <div className="flex space-x-4 text-white">
                    <div className="flex">{selectedImagesCountText()}</div>
                    <div className="flex">{selectedFilesSizeText()}</div>
                  </div>
                </div>
              )}
              <PostFormItemDraggableImagesAndVideo
                indexList={state.indexList}
                items={state.items ?? []}
                videoFile={state.videoFile as File}
                setItems={(items) => {
                  dispatch({
                    type: "SET_ITEMS",
                    payload: items,
                  })
                }}
                onChangeItems={(items) => {
                  dispatch({
                    type: "SET_ITEMS",
                    payload: items,
                  })
                }}
                maxItemsCount={config.post.maxImageCount}
                setIndexList={(indexList) => {
                  dispatch({
                    type: "SET_INDEX_LIST",
                    payload: indexList as number[],
                  })
                }}
                onChangePngInfo={(pngInfo) => {
                  dispatch({
                    type: "SET_PNG_INFO",
                    payload: pngInfo,
                  })
                }}
                onVideoChange={(value) => {
                  dispatch({ type: "SET_VIDEO_FILE", payload: value })
                }}
                onMosaicButtonClick={(content) => {
                  dispatch({
                    type: "SET_EDIT_TARGET_IMAGE_BASE64",
                    payload: content,
                  })
                }}
                setThumbnailBase64={(base64) => {
                  dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
                }}
                setOgpBase64={(base64) => {
                  dispatch({ type: "SET_OGP_BASE64", payload: base64 })
                }}
                setIsThumbnailLandscape={(isLandscape) => {
                  dispatch({
                    type: "SET_IS_THUMBNAIL_LANDSCAPE",
                    payload: isLandscape,
                  })
                }}
              />
            </div>
            {state.thumbnailBase64 !== null && (
              <PostFormItemThumbnailPositionAdjust
                isThumbnailLandscape={state.isThumbnailLandscape}
                thumbnailBase64={state.thumbnailBase64}
                thumbnailPosX={state.thumbnailPosX}
                thumbnailPosY={state.thumbnailPosY}
                setThumbnailPosX={(posX) => {
                  dispatch({
                    type: "SET_THUMBNAIL_POS_X",
                    payload: posX as number,
                  })
                }}
                setThumbnailPosY={(posY) => {
                  dispatch({
                    type: "SET_THUMBNAIL_POS_Y",
                    payload: posY as number,
                  })
                }}
              />
            )}
            {state.thumbnailBase64 !== null && state.ogpBase64 !== null && (
              <PostFormOgp
                imageBase64={state.thumbnailBase64}
                setOgpBase64={(base64) => {
                  dispatch({ type: "SET_OGP_BASE64", payload: base64 })
                }}
                ogpBase64={state.ogpBase64}
              />
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant={"secondary"}
              onClick={onInputPngInfo}
              className="m-2 ml-auto block"
            >
              {"PNG情報のみ読み込み"}
            </Button>
            <Button
              variant={"secondary"}
              className="m-2 ml-auto block"
              onClick={() => {
                dispatch({
                  type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG",
                  payload: true,
                })
              }}
            >
              {"生成画像"}
            </Button>
          </div>
          <PostImageFormInput
            imageInformation={state.pngInfo}
            state={inputState}
            dispatch={dispatchInput}
          />
        </div>
        <Button className="w-full" type="submit" onClick={onPost}>
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
