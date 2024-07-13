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
import {
  getExtractInfoFromPNG,
  type PNGInfo,
} from "@/_utils/get-extract-info-from-png"
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

  const { data, loading } = useQuery(pageQuery, {
    variables: {
      isSensitive:
        state.ratingRestriction === "R18" || state.ratingRestriction === "R18G",
      startAt: new Date().toISOString().split("T")[0],
      prompts: state.pngInfo?.params.prompt ?? "girl",
      year: state.date.getFullYear(),
      month: state.date.getMonth() + 1,
      day: state.date.getDate(),
    },
  })

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
      type: "SET_EDITED_IMAGE",
      payload: { base64 },
    })
  }

  const { data: viewer } = useQuery(viewerQuery, {
    skip: authContext.isLoggedIn,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId,
    },
  })

  const onCloseImageEffectTool = () => {
    dispatch({ type: "SET_EDIT_TARGET_IMAGE_BASE64", payload: null })
  }

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(createWorkMutation)

  const onDateInput = (value: string) => {
    dispatch({ type: "SET_RESERVATION_DATE", payload: value })
  }

  const onChangeTheme = (value: boolean) => {
    if (data === undefined) {
      throw new Error("theme is undefined")
    }
    if (data.dailyTheme === null) {
      throw new Error("theme.dailyTheme is null")
    }
    dispatch({
      type: "SET_THEME_ID",
      payload: {
        themeId: data.dailyTheme.id,
        themeTitle: data.dailyTheme.title,
      },
    })
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

      if (state.title === null) {
        toast("タイトルを入力してください")
        return
      }
      if (state.title.length > 120) {
        toast("タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 15 })

      if (state.caption && state.caption.length > 3000) {
        toast("キャプションは3000文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 20 })

      if (state.enTitle && state.enTitle.length > 120) {
        toast("英語タイトルは120文字以内で入力してください")
        return
      }
      dispatch({ type: "SET_PROGRESS", payload: 25 })

      if (state.enCaption && state.enCaption.length > 3000) {
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
        (state.reservationDate !== null && state.reservationTime === null) ||
        (state.reservationDate === null && state.reservationTime !== null)
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
        state.reservationDate !== null && state.reservationTime !== null
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
              title: state.title,
              entitle: state.enTitle,
              explanation: state.caption,
              enExplanation: state.enCaption,
              rating: state.ratingRestriction,
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
              title: state.title,
              entitle: state.enTitle,
              explanation: state.caption,
              enExplanation: state.enCaption,
              rating: state.ratingRestriction,
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
              videoUrl: null,
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
          payload: pngInfo as PostFormState["pngInfo"],
        })
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
  }

  const recommendedNotUsedTags = () => {
    return (data?.recommendedTagsFromPrompts?.filter(
      (tag) => !state.tags.map((t) => t.text).includes(tag.name),
    ) ?? []) as unknown as Tag[]
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
    return `イラスト${state.items.map((item) => item.content).length}枚`
  }

  const whiteListNotSelectedTags = (data?.whiteListTags?.filter(
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

  const setIsOpenImageGenerationDialog = (isOpen: boolean) => {
    dispatch({ type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG", payload: isOpen })
  }

  const setSelectGenerationIds = (selectedIds: string[]) => {
    dispatch({
      type: "SET_SELECTED_IMAGE_GENERATION_IDS",
      payload: selectedIds,
    })
  }

  const onSubmitGenerationImage = (selectedImage: string[]) => {
    dispatch({ type: "SET_SELECTED_IMAGE_GENERATION_IDS", payload: [] })
    dispatch({ type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG", payload: false })
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
  }

  const setPngInfo = (pngInfo: PNGInfo | null) => {
    dispatch({
      type: "SET_PNG_INFO",
      payload: pngInfo as PostFormState["pngInfo"],
    })
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
              state.isHovered ? "border-2 border-white border-dashed" : null
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
              items={state.items ?? []}
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
                dispatch({
                  type: "SET_PNG_INFO",
                  payload: pngInfo as PostFormState["pngInfo"],
                })
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
          {state.thumbnailBase64 !== null && (
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
          {state.thumbnailBase64 !== null && state.ogpBase64 !== null && (
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
                data?.aiModels
                  .filter((model) => model.workModelId !== null)
                  .map((model) => ({
                    id: model.workModelId as string,
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
                      setPngInfo={setPngInfo}
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
                title={data?.dailyTheme?.title ?? null}
                isLoading={loading}
              />
            )}
            {data && data?.appEvents.length > 0 && (
              <EventInput
                tags={state.tags}
                setTags={(tags) =>
                  dispatch({ type: "SET_TAGS", payload: tags })
                }
                eventName={data?.appEvents[0]?.title ?? null}
                eventDescription={data?.appEvents[0]?.description ?? null}
                eventTag={data?.appEvents[0]?.tag ?? null}
                endAt={data?.appEvents[0]?.endAt ?? 0}
                slug={data?.appEvents[0]?.slug ?? null}
              />
            )}
            <TagsInput
              whiteListTags={whiteListNotSelectedTags}
              tags={state.tags}
              setTags={(tags) => dispatch({ type: "SET_TAGS", payload: tags })}
              recommendedTags={recommendedNotUsedTags()}
            />
            {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
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
            {viewer?.albums && (
              <AlbumInput
                album={state.albumId}
                albums={
                  viewer?.albums.map((album) => ({
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
                viewer?.viewer?.currentPass?.type === "STANDARD" ||
                viewer?.viewer?.currentPass?.type === "PREMIUM"
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
      {state.editTargetImageBase64 !== null && (
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
        isOpen={state.isOpenImageGenerationDialog}
        setIsOpen={setIsOpenImageGenerationDialog}
        onSubmitted={onSubmitGenerationImage}
        selectedIds={state.selectedImageGenerationIds}
        setSelectIds={setSelectGenerationIds}
      />
    </>
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

const pageQuery = graphql(
  `query PageQuery(
    $isSensitive: Boolean!
    $startAt: String!
    $prompts: String!
    $year: Int,
    $month: Int,
    $day: Int,
  ) {
    aiModels(offset: 0, limit: 124, where: {}) {
      ...AiModelFields
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
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
    }
    whiteListTags(
      where: {
        isSensitive: $isSensitive
      }
    ) {
      ...PartialTagFields
    }
    recommendedTagsFromPrompts(prompts: $prompts) {
      ...PartialTagFields
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      dateText
      year
      month
      day
      worksCount,
      works(offset: 0, limit: 1) {
        ...PartialWorkFields
      }
    }
  }`,
  [
    partialWorkFieldsFragment,
    aiModelFieldsFragment,
    partialAlbumFieldsFragment,
    partialTagFieldsFragment,
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
