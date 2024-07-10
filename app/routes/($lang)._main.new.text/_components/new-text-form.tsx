import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { aiModelsQuery } from "@/_graphql/queries/model/models"
import { CaptionInput } from "@/routes/($lang)._main.new.image/_components/caption-input"
import { DateInput } from "@/routes/($lang)._main.new.image/_components/date-input"
import { ModelInput } from "@/routes/($lang)._main.new.image/_components/model-input"
import { RatingInput } from "@/routes/($lang)._main.new.image/_components/rating-input"
import { TasteInput } from "@/routes/($lang)._main.new.image/_components/taste-input"
import { TitleInput } from "@/routes/($lang)._main.new.image/_components/title-input"
import { ViewInput } from "@/routes/($lang)._main.new.image/_components/view-input"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"
import { useMutation, useQuery } from "@apollo/client/index"
import {} from "@dnd-kit/core"
import { useContext, useEffect, useState } from "react"
import type { Tag } from "@/_components/tag/tag-input"
import { TagsInput } from "@/routes/($lang)._main.new.image/_components/tag-input"
import { dailyThemeQuery } from "@/_graphql/queries/daily-theme/daily-theme"
import { ThemeInput } from "@/routes/($lang)._main.new.image/_components/theme-input"
import { CategoryEditableInput } from "@/routes/($lang)._main.new.image/_components/category-editable-input"
import { albumsQuery } from "@/_graphql/queries/album/albums"
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
import { whiteListTagsQuery } from "@/_graphql/queries/tag/white-list-tags"
import { recommendedTagsFromPromptsQuery } from "@/_graphql/queries/tag/recommended-tags-from-prompts"
import { Loader2Icon } from "lucide-react"
import PaintCanvas from "@/_components/paint-canvas"
import FullScreenContainer from "@/_components/full-screen-container"
import React from "react"
import type { TSortableItem } from "@/_components/drag/sortable-item"
import { toast } from "sonner"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { OgpInput } from "@/routes/($lang)._main.new.image/_components/ogp-input"
import { createRandomString } from "@/routes/($lang).generation._index/_utils/create-random-string"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { uploadPublicVideo } from "@/_utils/upload-public-video"
import { createWorkMutation } from "@/_graphql/mutations/create-work"
import { sha256 } from "@/_utils/sha256"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { resizeImage } from "@/_utils/resize-image"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { CommentsEditableInput } from "@/routes/($lang)._main.new.image/_components/comments-editable-input"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { appEventsQuery } from "@/_graphql/queries/app-events/app-events"
import { EventInput } from "@/routes/($lang)._main.new.image/_components/event-input"
import { viewerTokenQuery } from "@/_graphql/queries/viewer/viewer-token"
import { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import { ImageGenerationSelectorDialog } from "@/routes/($lang)._main.new.image/_components/image-generation-selector-dialog"
import { config } from "@/config"
import { useBeforeUnload } from "@remix-run/react"
import { CropImageField } from "@/_components/crop-image-field"
import { getBase64FromImageUrl } from "@/_utils/get-base64-from-image-url"
import { OgpInputForText } from "@/routes/($lang)._main.new.image/_components/ogp-input-for-text"

/**
 * 新規作品フォーム
 */
export const NewTextForm = () => {
  const [state, setState] = React.useState<boolean | null>(null)

  useBeforeUnload(
    React.useCallback(
      (event) => {
        // 変更がある場合のみ警告を表示
        if (state) {
          const confirmationMessage =
            "ページ遷移すると変更が消えますが問題無いですか？"
          event.returnValue = confirmationMessage // 標準
          return confirmationMessage // Chrome用
        }
      },
      [state],
    ),
  )

  const authContext = useContext(AuthContext)

  if (authContext.isLoading) return null

  if (!authContext || !authContext.userId) {
    return "ログインしてください"
  }

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  const { data: aiModels } = useQuery(aiModelsQuery, {
    variables: {
      limit: 124,
      offset: 0,
      where: {},
    },
    fetchPolicy: "cache-first",
  })

  const [pngInfo, setPngInfo] = useState<PNGInfo | null>(null)

  const { data: recommendedTagsRet, loading: recommendedTagsLoading } =
    useQuery(recommendedTagsFromPromptsQuery, {
      variables: {
        prompts: pngInfo?.params.prompt ?? "girl",
      },
    })

  const recommendedTags = recommendedTagsRet?.recommendedTagsFromPrompts?.map(
    (tag) =>
      ({
        id: tag.id,
        text: tag.name,
      }) as Tag,
  )

  const [date, setDate] = useState(new Date())

  const [isHideTheme, setIsHideTheme] = useState(false)

  const [isSensitiveWhiteTags, setIsSensitiveWhiteTags] = useState(false)

  const [isDrawing, setIsDrawing] = React.useState(false)

  const { data: whiteTagsRet } = useQuery(whiteListTagsQuery, {
    variables: {
      where: {
        isSensitive: isSensitiveWhiteTags,
      },
    },
    fetchPolicy: "cache-first",
  })

  const whiteTags = whiteTagsRet?.whiteListTags
    ? whiteTagsRet.whiteListTags.map(
        (tag) =>
          ({
            id: tag.id,
            text: tag.name,
          }) as Tag,
      )
    : []

  const {
    data: theme,
    loading: themeLoading,
    error,
  } = useQuery(dailyThemeQuery, {
    variables: {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // getMonth()は0から始まるので、1を足す
      day: date.getDate(), // getDate()は月の日にちを返す
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

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD 形式に変換

  const { data: appEventsResp } = useQuery(appEventsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 1,
      where: {
        startAt: today, // 今日の日付を使用
      },
    },
  })

  const appEvents = appEventsResp?.appEvents.length
    ? appEventsResp.appEvents[0]
    : null

  const optionAlbums = albums?.albums
    ? (albums?.albums.map((album) => ({
        id: album.id,
        name: album.title,
      })) as AiModel[])
    : []

  const optionModels = aiModels
    ? (aiModels?.aiModels.map((model) => ({
        id: model.workModelId,
        name: model.name,
      })) as AiModel[])
    : []

  /**
   * 画像の配列を保持する状態
   */
  const [isHovered, setIsHovered] = useState(false)

  const [title, setTitle] = useState("")

  const [enTitle, setEnTitle] = useState("")

  const [caption, setCaption] = useState("")

  const [enCaption, setEnCaption] = useState("")

  const [themeId, setThemeId] = useState("")

  const [editTargetImageBase64, setEditTargetImageBase64] = useState("")

  const [albumId, setAlbumId] = useState("")

  const [link, setLink] = useState("")

  const [tags, setTags] = useState<Tag[]>([])

  const [isTagEditable, setIsTagEditable] = useState(false)

  const [isCommentsEditable, setIsCommentsEditable] = useState(false)

  const [isAd, setIsAd] = useState(false)

  const [ratingRestriction, setRatingRestriction] =
    useState<IntrospectionEnum<"Rating">>("G")

  const [accessType, setAccessType] =
    useState<IntrospectionEnum<"AccessType">>("PUBLIC")

  const [imageStyle, setImageStyle] =
    useState<IntrospectionEnum<"ImageStyle">>("ILLUSTRATION")

  const [aiUsed, setAiUsed] = useState("1")

  const [reservationDate, setReservationDate] = useState("")

  const [reservationTime, setReservationTime] = useState("")

  const [isSetGenerationParams, setIsSetGenerationParams] = useState(true)

  const [items, setItems] = useState<TSortableItem[]>([])

  const [indexList, setIndexList] = useState<number[]>([])

  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [thumbnailBase64, setThumbnailBase64] = useState("")

  const [ogpBase64, setOgpBase64] = useState("")

  const [thumbnailPosX, setThumbnailPosX] = useState(0)

  const [thumbnailPosY, setThumbnailPosY] = useState(0)

  const [isThumbnailLandscape, setIsThumbnailLandscape] = useState(false) // サムネイルが横長かどうか

  const [isCreatedWork, setIsCreatedWork] = useState(false) // 作品作成が完了したかどうか

  const [isCreatingWork, setIsCreatingWork] = useState(false) // 作品作成中かどうか

  const [uploadedWorkId, setUploadedWorkId] = useState("")

  const [uploadedWorkUuid, setUploadedWorkUuid] = useState("")

  const [selectedImageGenerationIds, setSelectedImageGenerationIds] = useState<
    string[]
  >([])

  const [isOpenImageGenerationDialog, setIsOpenImageGenerationDialog] =
    useState(false)

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isLoading,
  })

  const currentPassType = pass?.viewer?.currentPass?.type

  const isSubscribed =
    currentPassType === "STANDARD" || currentPassType === "PREMIUM"

  const onCloseImageEffectTool = () => {
    setEditTargetImageBase64("")
  }

  const [createWork, { loading: isCreatedLoading }] =
    useMutation(createWorkMutation)

  const uploadVideo = async () => {
    if (authContext.userId === null || videoFile === null) {
      return ""
    }
    const videoUrl = await uploadPublicVideo(videoFile, token?.viewer?.token)
    return videoUrl
  }

  const uploadImages = async () => {
    if (authContext.userId === null) {
      return []
    }

    const images = items.map((item) => item.content)

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        const imageUrl = await uploadPublicImage(image, token?.viewer?.token)
        return imageUrl
      }),
    )

    return imageUrls
  }

  const successUploadedProcess = () => {
    setIsCreatingWork(false)
    setIsCreatedWork(true)
    toast("作品を投稿しました")
  }

  const PROGRESS_STEPS = {
    AUTH_CHECK: 5,
    TITLE_CHECK: 10,
    CAPTION_CHECK: 15,
    EN_TITLE_CHECK: 20,
    EN_CAPTION_CHECK: 25,
    FILE_CHECK: 30,
    RESERVATION_CHECK: 35,
    THUMBNAIL_RESIZE: 40,
    UPLOAD_THUMBNAILS: 50,
    VIDEO_PROCESSING: 60,
    IMAGE_PROCESSING: 60,
    WORK_CREATION: 80,
    SUCCESS: 100,
    FAILURE: 0,
  }

  const [progress, setProgress] = useState(0)

  /**
   * 投稿処理
   * @returns
   */
  const onPost = async () => {
    const uploadedImageUrls = []
    try {
      setIsCreatingWork(true)
      setProgress(PROGRESS_STEPS.AUTH_CHECK)

      if (!authContext || !authContext.userId) {
        toast("ログインしてください")
        return
      }
      setProgress(PROGRESS_STEPS.TITLE_CHECK)

      if (title === "") {
        toast("タイトルを入力してください")
        return
      }
      if (title.length > 120) {
        toast("タイトルは120文字以内で入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.CAPTION_CHECK)

      if (caption.length > 3000) {
        toast("キャプションは3000文字以内で入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.EN_TITLE_CHECK)

      if (enTitle.length > 120) {
        toast("英語タイトルは120文字以内で入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.EN_CAPTION_CHECK)

      if (enCaption.length > 3000) {
        toast("英語キャプションは3000文字以内で入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.FILE_CHECK)

      if (
        videoFile === null &&
        items.map((item) => item.content).length === 0
      ) {
        toast("画像もしくは動画を選択してください")
        return
      }
      setProgress(PROGRESS_STEPS.RESERVATION_CHECK)

      if (
        (reservationDate !== "" && reservationTime === "") ||
        (reservationDate === "" && reservationTime !== "")
      ) {
        toast("予約投稿の時間を入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.THUMBNAIL_RESIZE)

      const smallThumbnail = isThumbnailLandscape
        ? await resizeImage(thumbnailBase64, 400, 0, "webp")
        : await resizeImage(thumbnailBase64, 0, 400, "webp")
      const largeThumbnail = isThumbnailLandscape
        ? await resizeImage(thumbnailBase64, 600, 0, "webp")
        : await resizeImage(thumbnailBase64, 0, 600, "webp")
      setProgress(PROGRESS_STEPS.UPLOAD_THUMBNAILS)

      const smallThumbnailFileName = `${createRandomString(30)}.webp`
      const largeThumbnailFileName = `${createRandomString(30)}.webp`
      const ogpImageFileName = `${createRandomString(30)}.webp`
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
      const ogpBase64Url = ogpBase64
        ? await uploadPublicImage(ogpBase64, token?.viewer?.token)
        : ""
      if (ogpBase64Url !== "") {
        uploadedImageUrls.push(ogpBase64Url)
      }

      const reservedAt =
        reservationDate !== "" && reservationTime !== ""
          ? new Date(`${reservationDate}T${reservationTime}`).getTime()
          : undefined
      const mainImageSha256 = await sha256(thumbnailBase64)
      const mainImageSize = await getSizeFromBase64(thumbnailBase64)
      setProgress(PROGRESS_STEPS.VIDEO_PROCESSING)

      if (videoFile) {
        const videoUrl = await uploadVideo()
        const work = await createWork({
          variables: {
            input: {
              title: title,
              entitle: enTitle,
              explanation: caption,
              enExplanation: enCaption,
              rating: ratingRestriction,
              prompt: pngInfo?.params.prompt ?? "",
              negativePrompt: pngInfo?.params.negativePrompt ?? "",
              seed: pngInfo?.params.seed ?? "",
              sampler: pngInfo?.params.sampler ?? "",
              strength: pngInfo?.params.strength ?? "",
              noise: pngInfo?.params.noise ?? "",
              modelName: pngInfo?.params.model ?? "",
              modelHash: pngInfo?.params.modelHash ?? "",
              otherGenerationParams: "",
              pngInfo: pngInfo?.src ?? "",
              imageStyle: imageStyle,
              relatedUrl: link,
              tags: tags.map((tag) => tag.text),
              isTagEditable: isTagEditable,
              isCommentEditable: isCommentsEditable,
              thumbnailPosition: isThumbnailLandscape
                ? thumbnailPosX
                : thumbnailPosY,
              modelId: aiUsed,
              type: "VIDEO",
              subjectId: themeId,
              albumId: albumId,
              isPromotion: isAd,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: accessType,
              imageUrls: [largeThumbnailFileName],
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
              accessGenerationType: isSetGenerationParams
                ? "PUBLIC"
                : "PRIVATE",
            },
          },
        })

        if (work.data?.createWork) {
          setUploadedWorkId(work.data?.createWork.id)
          if (work.data?.createWork.accessType === "LIMITED") {
            setUploadedWorkUuid(work.data?.createWork.uuid ?? "")
          }
        }
        setProgress(PROGRESS_STEPS.WORK_CREATION)
      }

      if (videoFile === null && items.length !== 0) {
        const imageUrls = await uploadImages()
        if (imageUrls.length === 0) {
          toast("画像のアップロードに失敗しました")
          return
        }
        const work = await createWork({
          variables: {
            input: {
              title: title,
              entitle: enTitle,
              explanation: caption,
              enExplanation: enCaption,
              rating: ratingRestriction,
              prompt: pngInfo?.params.prompt ?? "",
              negativePrompt: pngInfo?.params.negativePrompt ?? "",
              seed: pngInfo?.params.seed ?? "",
              sampler: pngInfo?.params.sampler ?? "",
              strength: pngInfo?.params.strength ?? "",
              noise: pngInfo?.params.noise ?? "",
              modelName: pngInfo?.params.model ?? "",
              modelHash: pngInfo?.params.modelHash ?? "",
              otherGenerationParams: "",
              pngInfo: pngInfo?.src ?? "",
              imageStyle: imageStyle,
              relatedUrl: link,
              tags: tags.map((tag) => tag.text),
              isTagEditable: isTagEditable,
              isCommentEditable: isCommentsEditable,
              thumbnailPosition: isThumbnailLandscape
                ? thumbnailPosX
                : thumbnailPosY,
              modelId: aiUsed,
              type: "WORK",
              subjectId: themeId,
              albumId: albumId,
              isPromotion: isAd,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: accessType,
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
              accessGenerationType: isSetGenerationParams
                ? "PUBLIC"
                : "PRIVATE",
            },
          },
        })

        if (work.data?.createWork) {
          setUploadedWorkId(work.data?.createWork.id)
          if (work.data?.createWork.accessType === "LIMITED") {
            setUploadedWorkUuid(work.data?.createWork.uuid ?? "")
          }
        }
        setProgress(PROGRESS_STEPS.WORK_CREATION)
      }

      successUploadedProcess()
      setProgress(PROGRESS_STEPS.SUCCESS)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
      // biome-ignore lint/complexity/noForEach: <explanation>
      uploadedImageUrls.forEach(async (url) => {
        await deleteUploadedImage(url)
      })
      setProgress(PROGRESS_STEPS.FAILURE) // reset progress on failure
    } finally {
      setIsCreatingWork(false)
    }
  }

  const onInputPngInfo = () => {
    // ファイル選択をさせて、開いた画像からPNG情報を取得してセットする
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
        setPngInfo(pngInfo)
        toast("PNG情報を取得しました")
        return
      }
      setPngInfo(null)
      toast("PNG情報を取得できませんでした")
    }
    input.click()
  }

  useEffect(() => {
    if (items.map((item) => item.content).length === 0) {
      setPngInfo(null)
    }
    setState(true)
  }, [items])

  const onCrop = async (croppedImage: string) => {
    const base64 = await getBase64FromImageUrl(croppedImage)
    setThumbnailBase64(base64)
  }

  const onDeleteImage = () => {
    setThumbnailBase64("")
  }

  return (
    <>
      <div className="relative w-[100%]">
        <div className="mb-4 bg-gray-100 dark:bg-black">
          <CropImageField
            isHidePreviewImage={thumbnailBase64 === ""}
            cropWidth={400}
            cropHeight={200}
            onDeleteImage={onDeleteImage}
            onCrop={onCrop}
          />
          {thumbnailBase64 !== "" && (
            <OgpInputForText
              imageBase64={thumbnailBase64}
              setOgpBase64={setOgpBase64}
              ogpBase64={ogpBase64}
            />
          )}
          {thumbnailBase64 !== "" && (
            <OgpInput
              imageBase64={thumbnailBase64}
              setOgpBase64={setOgpBase64}
              ogpBase64={ogpBase64}
            />
          )}
          <div className="flex space-x-2">
            <Button
              variant={"secondary"}
              onClick={onInputPngInfo}
              className="m-2 ml-auto block"
            >
              PNG情報のみ読み込み
            </Button>
            <Button
              variant={"secondary"}
              onClick={() => {
                setIsOpenImageGenerationDialog(true)
              }}
              className="m-2 ml-auto block"
            >
              生成画像
            </Button>
          </div>
          <ScrollArea className="p-2">
            <TitleInput onChange={setTitle} />
            <CaptionInput setCaption={setCaption} />
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <Button variant={"secondary"} className="w-full">
                    英語キャプションを入力
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <TitleInput label={"英語タイトル"} onChange={setEnTitle} />
                  <CaptionInput
                    label={"英語キャプション"}
                    setCaption={setEnCaption}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <RatingInput
              rating={ratingRestriction}
              setRating={(rating) => {
                setRatingRestriction(rating)
                if (rating === "R18" || rating === "R18G") {
                  setIsSensitiveWhiteTags(true)
                } else {
                  setIsSensitiveWhiteTags(false)
                }
              }}
            />
            <ViewInput accessType={accessType} setAccessType={setAccessType} />
            <TasteInput imageStyle={imageStyle} setImageStyle={setImageStyle} />
            <ModelInput
              model={aiUsed}
              models={optionModels}
              setModel={setAiUsed}
            />
            {pngInfo && (
              <div className="flex items-center">
                <Checkbox
                  checked={isSetGenerationParams}
                  onCheckedChange={() => {
                    setIsSetGenerationParams((prev) => !prev)
                  }}
                  id="set-generation-check"
                />
                <label
                  htmlFor="set-generation-check"
                  className="ml-2 font-medium text-sm"
                >
                  生成情報を公開する
                </label>
              </div>
            )}
            {pngInfo && isSetGenerationParams && (
              <Accordion type="single" collapsible>
                <AccordionItem value="setting">
                  <AccordionTrigger>
                    <Button variant={"secondary"} className="w-full">
                      生成情報を確認する
                    </Button>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <GenerationParamsInput
                      pngInfo={pngInfo}
                      setPngInfo={setPngInfo}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <DateInput
              date={reservationDate}
              time={reservationTime}
              setDate={(value: string) => {
                setReservationDate(value)
                const today = new Date()
                today.setHours(0, 0, 0, 0) // 今日の日付の始まりに時間をセット
                const threeDaysLater = new Date(today)
                threeDaysLater.setDate(today.getDate() + 3) // 3日後の日付を設定

                const changeDate = new Date(value)
                changeDate.setHours(0, 0, 0, 0) // 入力された日付の時間をリセット

                // 入力された日付が今日または未来（今日から3日後まで）である場合のみ更新
                if (changeDate >= today && changeDate <= threeDaysLater) {
                  setDate(changeDate)
                  setIsHideTheme(false)
                } else {
                  setIsHideTheme(true)
                }
                setThemeId("")
              }}
              setTime={setReservationTime}
            />
            {!isHideTheme && (
              <ThemeInput
                onChange={(value: boolean) => {
                  if (value) {
                    setThemeId(theme?.dailyTheme?.id ?? "")
                    // タグをセット
                    setTags([
                      ...tags,
                      {
                        id: 9999,
                        text: theme?.dailyTheme?.title,
                      } as unknown as Tag,
                    ])
                  } else {
                    setThemeId("")
                    // タグを削除
                    const newTags = tags.filter(
                      (tag) => tag.text !== theme?.dailyTheme?.title,
                    )
                    setTags(newTags)
                  }
                }}
                title={theme?.dailyTheme?.title ?? ""}
                isLoading={themeLoading}
              />
            )}

            {appEvents && (
              <EventInput
                tags={tags}
                setTags={setTags}
                eventName={appEvents?.title ?? ""}
                eventDescription={appEvents?.description ?? ""}
                eventTag={appEvents?.tag ?? ""}
                endAt={appEvents?.endAt ?? 0}
                slug={appEvents?.slug ?? ""}
              />
            )}

            <TagsInput
              whiteListTags={whiteTags.filter(
                (tag) => !tags.map((tag) => tag.text).includes(tag.text),
              )}
              tags={tags}
              setTags={setTags}
              recommendedTags={
                recommendedTags?.filter(
                  (tag) => !tags.map((tag) => tag.text).includes(tag.text),
                ) ?? []
              }
            />

            {recommendedTagsLoading && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            <CategoryEditableInput
              isChecked={isTagEditable}
              onChange={setIsTagEditable}
            />
            <CommentsEditableInput
              isChecked={isCommentsEditable}
              onChange={setIsCommentsEditable}
            />
            <AlbumInput
              album={albumId}
              albums={optionAlbums}
              setAlbumId={(value: string) => {
                setAlbumId(value)
              }}
            />
            <RelatedLinkInput link={link} onChange={setLink} />
            <AdWorkInput
              isSubscribed={isSubscribed}
              isChecked={isAd}
              onChange={setIsAd}
            />
          </ScrollArea>
        </div>
        <div className="sticky bottom-0 bg-white pb-2 dark:bg-black">
          <Button className="w-full" type="submit" onClick={onPost}>
            投稿
          </Button>
        </div>
      </div>
      {editTargetImageBase64 !== "" && (
        <FullScreenContainer
          onClose={onCloseImageEffectTool}
          enabledScroll={isDrawing}
        >
          <PaintCanvas
            onChangeSetDrawing={setIsDrawing}
            imageUrl={editTargetImageBase64}
            isMosaicMode={true}
            isShowSubmitButton={true}
            onSubmit={(base64) => {
              setItems((prev) =>
                prev.map((item) =>
                  item.content === editTargetImageBase64
                    ? { ...item, content: base64 }
                    : item,
                ),
              )

              // もし先頭のアイテムを書き換えたならサムネイル更新
              if (items[0].content === editTargetImageBase64) {
                setThumbnailBase64(base64)
              }

              setEditTargetImageBase64("")
              setOgpBase64("")
            }}
          />
        </FullScreenContainer>
      )}

      <SuccessCreatedWorkDialog
        isOpen={isCreatedWork}
        title={title}
        imageBase64={thumbnailBase64}
        workId={uploadedWorkId}
        uuid={uploadedWorkUuid}
        shareTags={["Aipictors", "AIイラスト", "AIart"]}
        createdAt={new Date(`${reservationDate}T${reservationTime}`).getTime()}
      />

      <CreatingWorkDialog progress={progress} isOpen={isCreatingWork} />

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
