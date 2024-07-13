import React, { useReducer, useContext } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { CaptionInput } from "@/routes/($lang)._main.new.image/_components/caption-input"
import { DateInput } from "@/routes/($lang)._main.new.image/_components/date-input"
import { ModelInput } from "@/routes/($lang)._main.new.image/_components/model-input"
import { RatingInput } from "@/routes/($lang)._main.new.image/_components/rating-input"
import { TasteInput } from "@/routes/($lang)._main.new.image/_components/taste-input"
import { TitleInput } from "@/routes/($lang)._main.new.image/_components/title-input"
import { ViewInput } from "@/routes/($lang)._main.new.image/_components/view-input"
import { useMutation, useQuery } from "@apollo/client/index"
import { TagsInput } from "@/routes/($lang)._main.new.image/_components/tag-input"
import { ThemeInput } from "@/routes/($lang)._main.new.image/_components/theme-input"
import { CategoryEditableInput } from "@/routes/($lang)._main.new.image/_components/category-editable-input"
import { AlbumInput } from "@/routes/($lang)._main.new.image/_components/series-input"
import { AuthContext } from "@/_contexts/auth-context"
import { RelatedLinkInput } from "@/routes/($lang)._main.new.image/_components/related-link-input"
import { AdWorkInput } from "@/routes/($lang)._main.new.image/_components/ad-work-input"
import { getExtractInfoFromPNG } from "@/_utils/get-extract-info-from-png"
import { GenerationParamsInput } from "@/routes/($lang)._main.new.image/_components/generation-params-input"
import { Checkbox } from "@/_components/ui/checkbox"
import { Loader2Icon } from "lucide-react"
import PaintCanvas from "@/_components/paint-canvas"
import FullScreenContainer from "@/_components/full-screen-container"
import { toast } from "sonner"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { ThumbnailPositionAdjustInput } from "@/routes/($lang)._main.new.image/_components/thumbnail-position-adjust-input"
import { OgpInput } from "@/routes/($lang)._main.new.image/_components/ogp-input"
import { DraggableImagesAndVideoInput } from "@/routes/($lang)._main.new.image/_components/draggable-images-and-video.input"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { createWorkMutation } from "@/_graphql/mutations/create-work"
import { sha256 } from "@/_utils/sha256"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { resizeImage } from "@/_utils/resize-image"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { CommentsEditableInput } from "@/routes/($lang)._main.new.image/_components/comments-editable-input"
import { EventInput } from "@/routes/($lang)._main.new.image/_components/event-input"
import { ImageGenerationSelectorDialog } from "@/routes/($lang)._main.new.image/_components/image-generation-selector-dialog"
import { config } from "@/config"
import { useBeforeUnload } from "@remix-run/react"
import {
  initialState,
  postFormReducer,
  type PostFormState,
} from "@/routes/($lang)._main.new.image/_types/post-form-reducer"
import { uploadPublicVideo } from "@/_utils/upload-public-video"
import type { Tag } from "@/_components/tag/tag-input"
import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { aiModelFieldsFragment } from "@/_graphql/fragments/ai-model-fields"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"

/**
 * 新規作品フォーム
 */
export const NewImageForm = () => {
  const authContext = useContext(AuthContext)
  const [state, dispatch] = useReducer(postFormReducer, initialState)

  const selectImageFromImageGeneration = (
    selectedImage: string[],
    selectedIds: string[],
  ) => {
    dispatch({
      type: "SET_SELECTED_IMAGE_GENERATION_IDS",
      payload: selectedIds,
    })
    dispatch({
      type: "SET_ITEMS",
      payload: [
        ...state.items,
        ...selectedImage.map((image) => ({
          id: Math.floor(Math.random() * 10000),
          content: image,
        })),
      ],
    })
    dispatch({ type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG", payload: false })
  }

  const submitFromEditorCanvas = (base64: string) => {
    dispatch({
      type: "SET_ITEMS",
      payload: state.items.map((item) =>
        item.content === state.editTargetImageBase64
          ? { ...item, content: base64 }
          : item,
      ),
    })

    if (state.items[0]?.content === state.editTargetImageBase64) {
      dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
    }

    dispatch({ type: "SET_EDIT_TARGET_IMAGE_BASE64", payload: "" })
    dispatch({ type: "SET_OGP_BASE64", payload: "" })
  }

  const { data: token } = useQuery(viewerTokenQuery)

  const { data: aiModels } = useQuery(aiModelsQuery, {
    variables: {
      limit: 124,
      offset: 0,
      where: {},
    },
    fetchPolicy: "cache-first",
  })

  const { data: recommendedTagsRet, loading: recommendedTagsLoading } =
    useQuery(recommendedTagsFromPromptsQuery, {
      variables: {
        prompts: state.pngInfo?.params.prompt ?? "girl",
      },
    })

  const { data: whiteTagsRet } = useQuery(whiteListTagsQuery, {
    variables: {
      where: {
        isSensitive: state.isSensitiveWhiteTags,
      },
    },
    fetchPolicy: "cache-first",
  })

  const { data: theme, loading: themeLoading } = useQuery(dailyThemeQuery, {
    variables: {
      year: state.date.getFullYear(),
      month: state.date.getMonth() + 1,
      day: state.date.getDate(),
      offset: 0,
      limit: 0,
    },
    fetchPolicy: "cache-first",
  })

  const { data: albums } = useQuery(albumsQuery, {
    skip: authContext.isLoading,
    variables: {
      limit: 124,
      offset: 0,
      where: {
        ownerUserId: authContext.userId,
        isSensitiveAndAllRating: true,
        needInspected: false,
        needsThumbnailImage: false,
      },
    },
  })

  const { data: appEventsResp } = useQuery(appEventsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 1,
      where: {
        startAt: new Date().toISOString().split("T")[0],
      },
    },
  })

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isLoading,
  })

  const onCloseImageEffectTool = () => {
    dispatch({ type: "SET_EDIT_TARGET_IMAGE_BASE64", payload: "" })
  }

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(createWorkMutation)

  const onDateInput = (value: string) => {
    dispatch({ type: "SET_RESERVATION_DATE", payload: value })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(today.getDate() + 7)

    const changeDate = new Date(value)
    changeDate.setHours(0, 0, 0, 0)

    if (changeDate >= today && changeDate <= threeDaysLater) {
      dispatch({ type: "SET_DATE", payload: changeDate })
      dispatch({ type: "SET_HAS_NO_THEME", payload: false })
    } else {
      dispatch({ type: "SET_HAS_NO_THEME", payload: true })
    }
    dispatch({ type: "SET_THEME_ID", payload: "" })
  }

  const onChangeTheme = (value: boolean) => {
    if (value) {
      dispatch({ type: "SET_THEME_ID", payload: theme?.dailyTheme?.id ?? "" })
      dispatch({
        type: "ADD_TAG",
        payload: { id: "9999", text: theme?.dailyTheme?.title ?? "" },
      })
    } else {
      dispatch({ type: "SET_THEME_ID", payload: "" })
      dispatch({
        type: "SET_TAGS",
        payload: state.tags.filter(
          (tag) => tag.text !== theme?.dailyTheme?.title,
        ),
      })
    }
  }

  const onPost = async () => {
    const uploadedImageUrls = []
    try {
      dispatch({ type: "SET_IS_CREATING_WORK", payload: true })
      dispatch({ type: "SET_PROGRESS", payload: 5 })

      if (!authContext || !authContext.userId) {
        toast("ログインしてください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 10 })

      if (state.title === "") {
        toast("タイトルを入力してください")
        return
      }
      if (state.title.length > 120) {
        toast("タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 15 })

      if (state.caption.length > 3000) {
        toast("キャプションは3000文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 20 })

      if (state.enTitle.length > 120) {
        toast("英語タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 25 })

      if (state.enCaption.length > 3000) {
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
        (state.reservationDate !== "" && state.reservationTime === "") ||
        (state.reservationDate === "" && state.reservationTime !== "")
      ) {
        toast("予約投稿の時間を入力してください")
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
        token?.viewer?.token,
      )
      uploadedImageUrls.push(smallThumbnailUrl)
      const largeThumbnailUrl = await uploadPublicImage(
        largeThumbnail.base64,
        token?.viewer?.token,
      )
      uploadedImageUrls.push(largeThumbnailUrl)
      const ogpBase64Url = state.ogpBase64
        ? await uploadPublicImage(state.ogpBase64, token?.viewer?.token)
        : ""
      if (ogpBase64Url !== "") {
        uploadedImageUrls.push(ogpBase64Url)
      }

      const reservedAt =
        state.reservationDate !== "" && state.reservationTime !== ""
          ? new Date(
              `${state.reservationDate}T${state.reservationTime}`,
            ).getTime() +
            3600000 * 9
          : undefined
      const mainImageSha256 = await sha256(state.thumbnailBase64)
      const mainImageSize = await getSizeFromBase64(state.thumbnailBase64)
      dispatch({ type: "SET_PROGRESS", payload: 60 })

      if (state.videoFile) {
        const uploadVideo = async () => {
          if (authContext.userId === null || state.videoFile === null) {
            return ""
          }
          const videoUrl = await uploadPublicVideo(
            state.videoFile as File,
            token?.viewer?.token,
          )
          return videoUrl
        }

        const videoUrl = await uploadVideo()
        const work = await createWork({
          variables: {
            input: {
              title: state.title,
              entitle: state.enTitle,
              explanation: state.caption,
              enExplanation: state.enCaption,
              rating: state.ratingRestriction,
              prompt: state.pngInfo?.params.prompt ?? "",
              negativePrompt: state.pngInfo?.params.negativePrompt ?? "",
              seed: state.pngInfo?.params.seed ?? "",
              sampler: state.pngInfo?.params.sampler ?? "",
              strength: state.pngInfo?.params.strength ?? "",
              noise: state.pngInfo?.params.noise ?? "",
              modelName: state.pngInfo?.params.model ?? "",
              modelHash: state.pngInfo?.params.modelHash ?? "",
              otherGenerationParams: "",
              pngInfo: state.pngInfo?.src ?? "",
              imageStyle: state.imageStyle,
              relatedUrl: state.link,
              tags: state.tags.map((tag) => tag.text),
              isTagEditable: state.isTagEditable,
              isCommentEditable: state.isCommentsEditable,
              thumbnailPosition: state.isThumbnailLandscape
                ? state.thumbnailPosX
                : state.thumbnailPosY,
              modelId: state.aiUsed,
              type: "VIDEO",
              subjectId: state.themeId,
              albumId: state.albumId,
              isPromotion: state.isAd,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: state.accessType,
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
              accessGenerationType: state.isSetGenerationParams
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
              payload: work.data?.createWork.uuid ?? "",
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
              const imageUrl = await uploadPublicImage(
                image,
                token?.viewer?.token,
              )
              return imageUrl
            }),
          )

          return imageUrls
        }

        const imageUrls = await uploadImages()
        if (imageUrls.length === 0) {
          toast("画像のアップロードに失敗しました")
          return
        }
        const work = await createWork({
          variables: {
            input: {
              title: state.title,
              entitle: state.enTitle,
              explanation: state.caption,
              enExplanation: state.enCaption,
              rating: state.ratingRestriction,
              prompt: state.pngInfo?.params.prompt ?? "",
              negativePrompt: state.pngInfo?.params.negativePrompt ?? "",
              seed: state.pngInfo?.params.seed ?? "",
              sampler: state.pngInfo?.params.sampler ?? "",
              strength: state.pngInfo?.params.strength ?? "",
              noise: state.pngInfo?.params.noise ?? "",
              modelName: state.pngInfo?.params.model ?? "",
              modelHash: state.pngInfo?.params.modelHash ?? "",
              otherGenerationParams: "",
              pngInfo: state.pngInfo?.src ?? "",
              imageStyle: state.imageStyle,
              relatedUrl: state.link,
              tags: state.tags.map((tag) => tag.text),
              isTagEditable: state.isTagEditable,
              isCommentEditable: state.isCommentsEditable,
              thumbnailPosition: state.isThumbnailLandscape
                ? state.thumbnailPosX
                : state.thumbnailPosY,
              modelId: state.aiUsed,
              type: "WORK",
              subjectId: state.themeId,
              albumId: state.albumId,
              isPromotion: state.isAd,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: state.accessType,
              imageUrls: imageUrls,
              smallThumbnailImageURL: smallThumbnailUrl,
              smallThumbnailImageWidth: smallThumbnail.width,
              smallThumbnailImageHeight: smallThumbnail.height,
              largeThumbnailImageURL: largeThumbnailUrl,
              largeThumbnailImageWidth: largeThumbnail.width,
              largeThumbnailImageHeight: largeThumbnail.height,
              videoUrl: "",
              ogpImageUrl: ogpBase64Url,
              imageHeight: mainImageSize.height,
              imageWidth: mainImageSize.width,
              accessGenerationType: state.isSetGenerationParams
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
              payload: work.data?.createWork.uuid ?? "",
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
      if (pngInfo.src !== "") {
        dispatch({ type: "SET_PNG_INFO", payload: pngInfo })
        toast("PNG情報を取得しました")
        return
      }
      dispatch({ type: "SET_PNG_INFO", payload: null })
      toast("PNG情報を取得できませんでした")
    }
    input.click()
  }

  const setRating = (rating: PostFormState["ratingRestriction"]) => {
    dispatch({ type: "SET_RATING_RESTRICTION", payload: rating })
    if (rating === "R18" || rating === "R18G") {
      dispatch({ type: "SET_IS_SENSITIVE_WHITE_TAGS", payload: true })
    } else {
      dispatch({ type: "SET_IS_SENSITIVE_WHITE_TAGS", payload: false })
    }
  }

  const recommendedNotUsedTags = () => {
    return (recommendedTagsRet?.recommendedTagsFromPrompts?.filter(
      (tag) => !state.tags.map((t) => t.text).includes(tag.name),
    ) ?? []) as unknown as Tag[]
  }

  const selectedFilesSizeText = () => {
    const totalBytes = state.items
      .map((item) => item.content)
      .reduce((acc, imageBase64) => {
        const byteLength = new TextEncoder().encode(imageBase64).length
        return acc + byteLength
      }, 0)

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    }
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const selectedImagesCountText = () => {
    return `イラスト${state.items.map((item) => item.content).length}枚`
  }

  const whiteListNotSelectedTags = (whiteTagsRet?.whiteListTags?.filter(
    (tag) => !state.tags.map((t) => t.text).includes(tag.name),
  ) ?? []) as unknown as Tag[]

  const onStartMouseDrawing = (content: string) => {
    dispatch({ type: "SET_EDIT_TARGET_IMAGE_BASE64", payload: content })
  }

  const onVideoFileChange = (videoFile: PostFormState["videoFile"]) => {
    dispatch({ type: "SET_VIDEO_FILE", payload: videoFile })
  }

  const onChangeAccessTypeImageGenerationParameters = () => {
    dispatch({
      type: "SET_IS_SET_GENERATION_PARAMS",
      payload: !state.isSetGenerationParams,
    })
  }

  const onOpenImageGenerationDialog = () => {
    dispatch({ type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG", payload: true })
  }

  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (state.state) {
          const confirmationMessage =
            "ページ遷移すると変更が消えますが問題無いですか？"
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [state.state],
    ),
  )

  return (
    <>
      <div className="relative w-[100%]">
        <div className="mb-4 bg-gray-100 dark:bg-black">
          <div
            className={`relative items-center bg-gray-800 ${
              state.isHovered ? "border-2 border-white border-dashed" : ""
            }`}
          >
            {state.items.length !== 0 && (
              <div className="mb-4 bg-gray-600 p-1 pl-4 dark:bg-blend-darken">
                <div className="flex space-x-4 text-white">
                  <div className="flex">{selectedImagesCountText()}</div>
                  <div className="flex">{selectedFilesSizeText()}</div>
                </div>
              </div>
            )}
            <DraggableImagesAndVideoInput
              indexList={state.indexList}
              items={state.items}
              videoFile={state.videoFile as File}
              setItems={(items) =>
                dispatch({
                  type: "SET_ITEMS",
                  payload: items,
                })
              }
              onChangeItems={(items) =>
                dispatch({
                  type: "SET_ITEMS",
                  payload: items,
                })
              }
              maxItemsCount={config.post.maxImageCount}
              setIndexList={(indexList) =>
                dispatch({
                  type: "SET_INDEX_LIST",
                  payload: indexList as number[],
                })
              }
              onChangePngInfo={(pngInfo) =>
                dispatch({ type: "SET_PNG_INFO", payload: pngInfo })
              }
              onVideoChange={onVideoFileChange}
              onMosaicButtonClick={onStartMouseDrawing}
              setThumbnailBase64={(base64) =>
                dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
              }
              setOgpBase64={(base64) =>
                dispatch({ type: "SET_OGP_BASE64", payload: base64 })
              }
              setIsThumbnailLandscape={(isLandscape) =>
                dispatch({
                  type: "SET_IS_THUMBNAIL_LANDSCAPE",
                  payload: isLandscape,
                })
              }
            />
          </div>
          {state.thumbnailBase64 !== "" && (
            <ThumbnailPositionAdjustInput
              isThumbnailLandscape={state.isThumbnailLandscape}
              thumbnailBase64={state.thumbnailBase64}
              thumbnailPosX={state.thumbnailPosX}
              thumbnailPosY={state.thumbnailPosY}
              setThumbnailPosX={(posX) =>
                dispatch({
                  type: "SET_THUMBNAIL_POS_X",
                  payload: posX as number,
                })
              }
              setThumbnailPosY={(posY) =>
                dispatch({
                  type: "SET_THUMBNAIL_POS_Y",
                  payload: posY as number,
                })
              }
            />
          )}
          {state.thumbnailBase64 !== "" && (
            <OgpInput
              imageBase64={state.thumbnailBase64}
              setOgpBase64={(base64) =>
                dispatch({ type: "SET_OGP_BASE64", payload: base64 })
              }
              ogpBase64={state.ogpBase64}
            />
          )}
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
              onClick={onOpenImageGenerationDialog}
              className="m-2 ml-auto block"
            >
              {"生成画像"}
            </Button>
          </div>
          <ScrollArea className="p-2">
            <TitleInput
              onChange={(title) =>
                dispatch({ type: "SET_TITLE", payload: title })
              }
            />
            <CaptionInput
              setCaption={(caption) =>
                dispatch({ type: "SET_CAPTION", payload: caption })
              }
            />
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <Button variant={"secondary"} className="w-full">
                    英語キャプションを入力
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <TitleInput
                    label={"英語タイトル"}
                    onChange={(enTitle) =>
                      dispatch({ type: "SET_EN_TITLE", payload: enTitle })
                    }
                  />
                  <CaptionInput
                    label={"英語キャプション"}
                    setCaption={(enCaption) =>
                      dispatch({ type: "SET_EN_CAPTION", payload: enCaption })
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <RatingInput
              rating={state.ratingRestriction}
              setRating={setRating}
            />
            <ViewInput
              accessType={state.accessType}
              setAccessType={(accessType) =>
                dispatch({ type: "SET_ACCESS_TYPE", payload: accessType })
              }
            />
            <TasteInput
              imageStyle={state.imageStyle}
              setImageStyle={(imageStyle) =>
                dispatch({ type: "SET_IMAGE_STYLE", payload: imageStyle })
              }
            />
            <ModelInput
              model={state.aiUsed}
              models={
                aiModels?.aiModels.map((model) => ({
                  id: model.workModelId ?? "",
                  name: model.name,
                })) ?? []
              }
              setModel={(model) =>
                dispatch({ type: "SET_AI_USED", payload: model })
              }
            />
            {state.pngInfo && (
              <div className="flex items-center">
                <Checkbox
                  checked={state.isSetGenerationParams}
                  onCheckedChange={onChangeAccessTypeImageGenerationParameters}
                  id="set-generation-check"
                />
                <label
                  htmlFor="set-generation-check"
                  className="ml-2 font-medium text-sm"
                >
                  {"生成情報を公開する"}
                </label>
              </div>
            )}
            {state.pngInfo && state.isSetGenerationParams && (
              <Accordion type="single" collapsible>
                <AccordionItem value="setting">
                  <AccordionTrigger>
                    <Button variant={"secondary"} className="w-full">
                      生成情報を確認する
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <GenerationParamsInput
                      pngInfo={state.pngInfo}
                      setPngInfo={(pngInfo) =>
                        dispatch({ type: "SET_PNG_INFO", payload: pngInfo })
                      }
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <DateInput
              date={state.reservationDate}
              time={state.reservationTime}
              setDate={onDateInput}
              setTime={(time) =>
                dispatch({ type: "SET_RESERVATION_TIME", payload: time })
              }
            />
            {!state.hasNoTheme && (
              <ThemeInput
                onChange={onChangeTheme}
                title={theme?.dailyTheme?.title ?? ""}
                isLoading={themeLoading}
              />
            )}
            {appEventsResp && appEventsResp?.appEvents.length > 0 && (
              <EventInput
                tags={state.tags}
                setTags={(tags) =>
                  dispatch({ type: "SET_TAGS", payload: tags })
                }
                eventName={appEventsResp?.appEvents[0]?.title ?? ""}
                eventDescription={
                  appEventsResp?.appEvents[0]?.description ?? ""
                }
                eventTag={appEventsResp?.appEvents[0]?.tag ?? ""}
                endAt={appEventsResp?.appEvents[0]?.endAt ?? 0}
                slug={appEventsResp?.appEvents[0]?.slug ?? ""}
              />
            )}
            <TagsInput
              whiteListTags={whiteListNotSelectedTags}
              tags={state.tags}
              setTags={(tags) => dispatch({ type: "SET_TAGS", payload: tags })}
              recommendedTags={recommendedNotUsedTags()}
            />
            {recommendedTagsLoading && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            <CategoryEditableInput
              isChecked={state.isTagEditable}
              onChange={(isTagEditable) =>
                dispatch({
                  type: "SET_IS_TAG_EDITABLE",
                  payload: isTagEditable,
                })
              }
            />
            <CommentsEditableInput
              isChecked={state.isCommentsEditable}
              onChange={(isCommentsEditable) =>
                dispatch({
                  type: "SET_IS_COMMENTS_EDITABLE",
                  payload: isCommentsEditable,
                })
              }
            />
            {albums?.albums && (
              <AlbumInput
                album={state.albumId}
                albums={
                  albums?.albums.map((album) => ({
                    id: album.id,
                    name: album.title,
                  })) ?? []
                }
                setAlbumId={(albumId) =>
                  dispatch({ type: "SET_ALBUM_ID", payload: albumId })
                }
              />
            )}
            <RelatedLinkInput
              link={state.link}
              onChange={(link) => dispatch({ type: "SET_LINK", payload: link })}
            />
            <AdWorkInput
              isSubscribed={
                pass?.viewer?.currentPass?.type === "STANDARD" ||
                pass?.viewer?.currentPass?.type === "PREMIUM"
              }
              isChecked={state.isAd}
              onChange={(isAd) =>
                dispatch({ type: "SET_IS_AD", payload: isAd })
              }
            />
          </ScrollArea>
        </div>
        <div className="sticky bottom-0 bg-white pb-2 dark:bg-black">
          <Button className="w-full" type="submit" onClick={onPost}>
            {"投稿"}
          </Button>
        </div>
      </div>
      {state.editTargetImageBase64 !== "" && (
        <FullScreenContainer
          onClose={onCloseImageEffectTool}
          enabledScroll={state.isDrawing}
        >
          <PaintCanvas
            onChangeSetDrawing={(isDrawing) =>
              dispatch({ type: "SET_IS_DRAWING", payload: isDrawing })
            }
            imageUrl={state.editTargetImageBase64}
            isMosaicMode={true}
            isShowSubmitButton={true}
            onSubmit={submitFromEditorCanvas}
          />
        </FullScreenContainer>
      )}
      <SuccessCreatedWorkDialog
        isOpen={state.isCreatedWork}
        title={state.title}
        imageBase64={state.thumbnailBase64}
        workId={state.uploadedWorkId}
        uuid={state.uploadedWorkUuid}
        shareTags={["Aipictors", "AIイラスト", "AIart"]}
        createdAt={new Date(
          `${state.reservationDate}T${state.reservationTime}`,
        ).getTime()}
      />
      <CreatingWorkDialog
        progress={state.progress}
        isOpen={state.isCreatingWork}
      />
      <ImageGenerationSelectorDialog
        isOpen={isOpenImageGenerationDialog}
        setIsOpen={setIsOpenImageGenerationDialog}
        onSubmitted={(selectedImage: string[], selectedIds: string[]) => {
          setSelectedImageGenerationIds(selectedIds)
          setItems((prev) => {
            if (
              config.post.maxImageCount <
              selectedImage.length + prev.length
            ) {
              toast(`最大${config.post.maxImageCount}までです`)
              return [...prev]
            }

            // 既存の items の URL のセットを作成
            const existingUrls = new Set(prev.map((item) => item.content))

            // 新しく追加する items のフィルタリング
            const newItems = selectedImage
              .filter((image) => !existingUrls.has(image))
              .map((image) => ({
                id: Math.floor(Math.random() * 10000),
                content: image,
              }))

            // 既存の items に新しい items を追加
            return [...prev, ...newItems]
          })
          setIsOpenImageGenerationDialog(false)
          setSelectedImageGenerationIds([])
        }}
        selectedIds={selectedImageGenerationIds}
        setSelectIds={setSelectedImageGenerationIds}
      />
    </>
  )
}

export const albumsQuery = graphql(
  `query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }`,
  [partialAlbumFieldsFragment, partialUserFieldsFragment],
)

export const appEventsQuery = graphql(
  `query AppEvents( $limit: Int!, $offset: Int!, $where: AppEventsWhereInput) {
    appEvents(limit: $limit, offset: $offset, where: $where) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
    }
  }`,
)

export const dailyThemeQuery = graphql(
  `query DailyTheme($year: Int, $month: Int, $day: Int, $offset: Int!, $limit: Int!) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      dateText
      year
      month
      day
      worksCount,
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)

export const aiModelsQuery = graphql(
  `query AiModels($offset: Int!, $limit: Int!, $where: AiModelWhereInput) {
    aiModels(offset: $offset, limit: $limit, where: $where) {
      ...AiModelFields
    }
  }`,
  [aiModelFieldsFragment],
)

export const recommendedTagsFromPromptsQuery = graphql(
  `query RecommendedTagsFromPrompts($prompts: String!) {
    recommendedTagsFromPrompts(prompts: $prompts) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)

export const whiteListTagsQuery = graphql(
  `query WhiteListTags($where: WhiteListTagsInput!) {
    whiteListTags(where: $where) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)

export const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      token
    }
  }`,
)
