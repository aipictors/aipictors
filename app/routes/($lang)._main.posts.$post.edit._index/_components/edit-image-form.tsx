import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/_components/ui/accordion"
import { Button } from "@/_components/ui/button"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { PostFormItemCaption } from "@/routes/($lang)._main.new.image/_components/post-form-item-caption"
import { PostFormItemDate } from "@/routes/($lang)._main.new.image/_components/post-form-item-date"
import { PostFormItemModel } from "@/routes/($lang)._main.new.image/_components/post-form-item-model"
import { PostFormItemRating } from "@/routes/($lang)._main.new.image/_components/post-form-item-rating"
import { PostFormItemTaste } from "@/routes/($lang)._main.new.image/_components/post-form-item-taste"
import { PostFormItemTitle } from "@/routes/($lang)._main.new.image/_components/post-form-item-title"
import { PostFormItemView } from "@/routes/($lang)._main.new.image/_components/post-form-item-view"
import type { AiModel } from "@/routes/($lang)._main.new.image/_types/model"
import { useMutation, useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import type { Tag } from "@/_components/tag/tag-input"
import { PostFormItemTheme } from "@/routes/($lang)._main.new.image/_components/post-form-item-theme"
import { PostFormCategoryEditable } from "@/routes/($lang)._main.new.image/_components/post-form-category-editable"
import { PostFormItemAlbum } from "@/routes/($lang)._main.new.image/_components/post-form-item-album"
import { AuthContext } from "@/_contexts/auth-context"
import { PostFormItemRelatedLink } from "@/routes/($lang)._main.new.image/_components/post-form-item-related-link"
import { PostFormItemAdvertising } from "@/routes/($lang)._main.new.image/_components/post-form-item-advertising"
import type { PNGInfo } from "@/_utils/get-extract-info-from-png"
import { PostFormItemGenerationParams } from "@/routes/($lang)._main.new.image/_components/post-form-item-generation-params"
import { Checkbox } from "@/_components/ui/checkbox"
import { Loader2Icon } from "lucide-react"
import PaintCanvas from "@/_components/paint-canvas"
import FullScreenContainer from "@/_components/full-screen-container"
import React from "react"
import type { TSortableItem } from "@/_components/drag/sortable-item"
import { toast } from "sonner"
import { uploadPublicImage } from "@/_utils/upload-public-image"
import { PostFormItemThumbnailPositionAdjust } from "@/routes/($lang)._main.new.image/_components/post-form-item-thumbnail-position-adjust"
import { createRandomString } from "@/routes/($lang).generation._index/_utils/create-random-string"
import { PostFormItemDraggableImagesAndVideo } from "@/routes/($lang)._main.new.image/_components/post-form-item-draggable-images-and-video"
import { SuccessCreatedWorkDialog } from "@/routes/($lang)._main.new.image/_components/success-created-work-dialog"
import { sha256 } from "@/_utils/sha256"
import { CreatingWorkDialog } from "@/routes/($lang)._main.new.image/_components/creating-work-dialog"
import { resizeImage } from "@/_utils/resize-image"
import { getSizeFromBase64 } from "@/_utils/get-size-from-base64"
import { deleteUploadedImage } from "@/_utils/delete-uploaded-image"
import { PostFormCommentsEditable } from "@/routes/($lang)._main.new.image/_components/post-form-comments-editable"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { getBase64FromAipictorsUrl } from "@/_utils/get-base64-from-aipicors-url"
import { PostFormItemEvent } from "@/routes/($lang)._main.new.image/_components/post-form-item-event"
import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { aiModelFieldsFragment } from "@/_graphql/fragments/ai-model-fields"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { subWorkFieldsFragment } from "@/_graphql/fragments/sub-work-fields"
import { userFieldsFragment } from "@/_graphql/fragments/user-fields"
import { PostFormItemTags } from "@/routes/($lang)._main.new.image/_components/post-form-item-tags"
import { PostFormOgp } from "@/routes/($lang)._main.new.image/_components/post-form-ogp"

type Props = {
  workId: string
}

/**
 * 作品編集フォーム
 */
export const EditImageForm = (props: Props) => {
  const authContext = useContext(AuthContext)

  if (!authContext || !authContext.userId) {
    return "ログインしてください"
  }

  const { data: work } = useQuery(workQuery, {
    skip: authContext.isLoading,
    variables: {
      id: props.workId,
    },
  })

  console.log(work)

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

  const workCreatedAt = work?.work?.createdAt.toString() ?? today

  const { data: appEventsResp } = useQuery(appEventsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 0,
      limit: 1,
      where: {
        startAt: workCreatedAt,
        endAt: today,
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

  const [title, setTitle] = useState(work?.work?.title ?? "")

  const [enTitle, setEnTitle] = useState(work?.work?.enTitle ?? "")

  const [caption, setCaption] = useState(work?.work?.description ?? "")

  const [enCaption, setEnCaption] = useState(work?.work?.enDescription ?? "")

  const [themeId, setThemeId] = useState(work?.work?.dailyTheme?.id ?? "")

  const [editTargetImageUrl, setEditTargetImageUrl] = useState("")

  const [editTargetImageBase64, setEditTargetImageBase64] = useState("")

  const [albumId, setAlbumId] = useState(work?.work?.album?.id ?? "")

  const [link, setLink] = useState(work?.work?.relatedUrl ?? "")

  const [tags, setTags] = useState<Tag[]>([
    ...(work?.work?.tagNames ?? []).map((tag) => ({ text: tag }) as Tag),
  ])

  const [isTagEditable, setIsTagEditable] = useState(work?.work?.isTagEditable)

  const [isCommentsEditable, setIsCommentsEditable] = useState(
    work?.work?.isCommentsEditable,
  )

  const [isAd, setIsAd] = useState(work?.work?.isPromotion)

  const [ratingRestriction, setRatingRestriction] = useState<
    IntrospectionEnum<"Rating">
  >(work?.work?.rating ?? "G")

  const [accessType, setAccessType] = useState<IntrospectionEnum<"AccessType">>(
    work?.work?.accessType ?? "PUBLIC",
  )

  const [imageStyle, setImageStyle] = useState<IntrospectionEnum<"ImageStyle">>(
    work?.work?.style ?? "ILLUSTRATION",
  )

  const [aiUsed, setAiUsed] = useState<string>(
    work?.work?.workModelId?.toString() ?? "0",
  )

  const [reservationDate, setReservationDate] = useState("")

  const [reservationTime, setReservationTime] = useState("")

  const [isSetGenerationParams, setIsSetGenerationParams] = useState(
    work?.work?.isGeneration,
  )

  const [items, setItems] = useState<TSortableItem[]>([
    {
      id: 0,
      content: work?.work?.imageURL ?? "",
    },
    ...(work?.work?.subWorks ?? []).map((subWork, index) => ({
      id: index + 1,
      content: subWork.imageUrl ?? "",
    })),
  ])

  const [indexList, setIndexList] = useState<number[]>([])

  const [videoFile, setVideoFile] = useState<File | null>(null)

  const [thumbnailBase64, setThumbnailBase64] = useState(
    work?.work?.largeThumbnailImageURL ?? "",
  )

  const [ogpBase64, setOgpBase64] = useState(
    work?.work?.ogpThumbnailImageUrl ?? "",
  )

  const [thumbnailPosX, setThumbnailPosX] = useState(0)

  const [thumbnailPosY, setThumbnailPosY] = useState(0)

  const [isThumbnailLandscape, setIsThumbnailLandscape] = useState(false) // サムネイルが横長かどうか

  const [isCreatedWork, setIsCreatedWork] = useState(false) // 作品作成が完了したかどうか

  const [isCreatingWork, setIsCreatingWork] = useState(false) // 作品作成中かどうか

  const [uploadedWorkId, setUploadedWorkId] = useState("")

  const [uploadedWorkUuid, setUploadedWorkUuid] = useState("")

  const [base64Cache, setBase64Cache] = useState<{ [key: string]: string }>({})

  const { data: token, refetch: tokenRefetch } = useQuery(viewerTokenQuery)

  useEffect(() => {
    setTitle(work?.work?.title ?? "")
    setEnTitle(work?.work?.enTitle ?? "")
    setCaption(work?.work?.description ?? "")
    setEnCaption(work?.work?.enDescription ?? "")
    setRatingRestriction(work?.work?.rating ?? "G")
    setAccessType(work?.work?.accessType ?? "PUBLIC")
    setImageStyle(work?.work?.style ?? "ILLUSTRATION")
    setLink(work?.work?.relatedUrl ?? "")
    setTags((work?.work?.tagNames ?? []).map((tag) => ({ text: tag }) as Tag))
    setIsTagEditable(work?.work?.isTagEditable)
    setIsCommentsEditable(work?.work?.isCommentsEditable)
    setIsAd(work?.work?.isPromotion)
    setAiUsed(work?.work?.workModelId?.toString() ?? "0")
    setAlbumId(work?.work?.album?.id ?? "")
    setThemeId(work?.work?.dailyTheme?.id ?? "")
    setIsSetGenerationParams(work?.work?.isGeneration)
    setThumbnailBase64(work?.work?.largeThumbnailImageURL ?? "")
    setOgpBase64(work?.work?.ogpThumbnailImageUrl ?? "")

    // 生成情報
    if (
      work?.work?.prompt ||
      work?.work?.negativePrompt ||
      work?.work?.seed ||
      work?.work?.sampler ||
      work?.work?.strength ||
      work?.work?.noise ||
      work?.work?.model ||
      work?.work?.modelHash ||
      work?.work?.pngInfo
    ) {
      setPngInfo({
        src: work?.work?.pngInfo ?? "",
        params: {
          prompt: work?.work?.prompt ?? "",
          negativePrompt: work?.work?.negativePrompt ?? "",
          seed: work?.work?.seed?.toString() ?? "",
          sampler: work?.work?.sampler ?? "",
          strength: work?.work?.strength ?? "",
          noise: work?.work?.noise ?? "",
          model: work?.work?.model ?? "",
          modelHash: work?.work?.modelHash ?? "",
          steps: work?.work?.steps ? work?.work?.steps.toString() : "",
          scale: work?.work?.scale ? work?.work?.scale.toString() : "",
          vae: "",
        },
      })
    }

    console.log("work?.work?.prompt", work?.work?.prompt)

    // 現在時刻よりも未来の時刻なら予約更新の日付と時間をセット
    if (work?.work?.createdAt) {
      const reservedDate = new Date(work?.work?.createdAt * 1000 + 3600000 * 9)
      const now = new Date(Date.now() + 3600000 * 9)
      if (reservedDate > now) {
        setReservationDate(reservedDate.toISOString().slice(0, 10))
        setReservationTime(reservedDate.toISOString().slice(11, 16))
      }
    }
    // 画像アイテムをセット（メイン、複数画像）
    setItems([
      {
        id: 0,
        content: work?.work?.imageURL ?? "",
      },
      ...(work?.work?.subWorks ?? []).map((subWork, index) => ({
        id: index + 1,
        content: subWork.imageUrl ?? "",
      })),
    ])

    // ポジションを設定
    if (
      work?.work?.smallThumbnailImageWidth &&
      work?.work?.smallThumbnailImageHeight
    ) {
      if (
        work?.work?.smallThumbnailImageWidth >
        work?.work?.smallThumbnailImageHeight
      ) {
        setIsThumbnailLandscape(true)
        setThumbnailPosX(work?.work?.thumbnailImagePosition ?? 0)
      } else {
        setIsThumbnailLandscape(false)
        setThumbnailPosY(work?.work?.thumbnailImagePosition ?? 0)
      }
    }
  }, [work])

  const onCloseImageEffectTool = () => {
    setEditTargetImageBase64("")
    setEditTargetImageUrl("")
  }

  const [updateWork, { loading: isUpdatedLoading }] =
    useMutation(updateWorkMutation)

  const uploadImages = async () => {
    if (authContext.userId === null) {
      return []
    }

    const images = items.map((item) => item.content)

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        if (!image) {
          return null
        }
        const imageUrl = image.startsWith("https://")
          ? image
          : await uploadPublicImage(image, token?.viewer?.token)
        return imageUrl
      }),
    )

    return imageUrls
  }

  const successUploadedProcess = () => {
    setIsCreatingWork(false)
    setIsCreatedWork(true)
    toast("作品を更新しました")
  }

  // ステップごとの進捗割合を定義
  const PROGRESS_STEPS = {
    AUTH_CHECK: 5,
    TITLE_CHECK: 10,
    CAPTION_CHECK: 15,
    EN_TITLE_CHECK: 20,
    EN_CAPTION_CHECK: 25,
    FILE_CHECK: 30,
    RESERVATION_CHECK: 35,
    THUMBNAIL_CHECK: 40,
    THUMBNAIL_RESIZE: 50,
    UPLOAD_THUMBNAILS: 60,
    VIDEO_PROCESSING: 70,
    IMAGE_PROCESSING: 70,
    WORK_CREATION: 80,
    SUCCESS: 100,
    FAILURE: 0,
  }

  const [progress, setProgress] = useState(0)

  /**
   * 更新処理
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
        toast("予約更新の時間を入力してください")
        return
      }
      setProgress(PROGRESS_STEPS.THUMBNAIL_CHECK)

      if (thumbnailBase64 === "") {
        toast("サムネイルを設定してください")
        return
      }
      setProgress(PROGRESS_STEPS.THUMBNAIL_RESIZE)

      const smallThumbnail = thumbnailBase64.startsWith("https://")
        ? null
        : isThumbnailLandscape
          ? await resizeImage(thumbnailBase64, 400, 0, "webp")
          : await resizeImage(thumbnailBase64, 0, 400, "webp")
      const largeThumbnail = thumbnailBase64.startsWith("https://")
        ? null
        : isThumbnailLandscape
          ? await resizeImage(thumbnailBase64, 600, 0, "webp")
          : await resizeImage(thumbnailBase64, 0, 600, "webp")
      setProgress(PROGRESS_STEPS.UPLOAD_THUMBNAILS)

      const largeThumbnailFileName = `${createRandomString(30)}.webp`
      const smallThumbnailUrl =
        thumbnailBase64.startsWith("https://") || smallThumbnail === null
          ? work?.work?.smallThumbnailImageURL ?? ""
          : await uploadPublicImage(smallThumbnail.base64, token?.viewer?.token)
      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl =
        thumbnailBase64.startsWith("https://") || largeThumbnail === null
          ? work?.work?.largeThumbnailImageURL ?? ""
          : await uploadPublicImage(largeThumbnail.base64, token?.viewer?.token)
      uploadedImageUrls.push(largeThumbnailUrl)

      const ogpBase64Url =
        ogpBase64 === "" || ogpBase64.startsWith("https://")
          ? work?.work?.ogpThumbnailImageUrl
          : await uploadPublicImage(ogpBase64, token?.viewer?.token)
      if (
        work?.work?.ogpThumbnailImageUrl !== null &&
        (ogpBase64Url === "" ||
          ogpBase64Url === undefined ||
          ogpBase64Url === null)
      ) {
        toast("サムネイルのアップロードに失敗しました")
        return
      }
      uploadedImageUrls.push(ogpBase64Url)

      const reservedAt =
        reservationDate !== "" && reservationTime !== ""
          ? new Date(`${reservationDate}T${reservationTime}`).getTime() +
            3600000 * 9
          : undefined
      const mainImageSha256 = await sha256(thumbnailBase64)
      const mainImageSize = await getSizeFromBase64(thumbnailBase64)
      setProgress(PROGRESS_STEPS.VIDEO_PROCESSING)

      const videoUrl = work?.work?.url ?? ""
      if (videoUrl) {
        const uploadedWork = await updateWork({
          variables: {
            input: {
              id: props.workId,
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
              isTagEditable: isTagEditable ?? false,
              isCommentEditable: isCommentsEditable ?? false,
              thumbnailPosition: isThumbnailLandscape
                ? thumbnailPosX
                : thumbnailPosY,
              modelId: aiUsed ?? 0,
              type: "VIDEO",
              subjectId: themeId,
              albumId: albumId,
              isPromotion: isAd ?? false,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: accessType,
              imageUrls: [largeThumbnailFileName],
              smallThumbnailImageURL: smallThumbnailUrl,
              smallThumbnailImageWidth: smallThumbnail
                ? smallThumbnail.width
                : work?.work?.smallThumbnailImageWidth ?? 0,
              smallThumbnailImageHeight: smallThumbnail
                ? smallThumbnail.height
                : work?.work?.smallThumbnailImageHeight ?? 0,
              largeThumbnailImageURL: largeThumbnailUrl,
              largeThumbnailImageWidth: largeThumbnail
                ? largeThumbnail.width
                : work?.work?.largeThumbnailImageWidth ?? 0,
              largeThumbnailImageHeight: largeThumbnail
                ? largeThumbnail.height
                : work?.work?.largeThumbnailImageHeight ?? 0,
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

        if (uploadedWork.data?.updateWork) {
          setUploadedWorkId(uploadedWork.data.updateWork.id)
          if (uploadedWork.data.updateWork.accessType === "LIMITED") {
            setUploadedWorkUuid(uploadedWork.data.updateWork.uuid ?? "")
          }
        }
        setProgress(PROGRESS_STEPS.WORK_CREATION)
      }

      if (videoFile === null && items.length !== 0) {
        const imageUrls = await uploadImages().then((urls) =>
          urls.filter((url) => url !== null),
        )
        if (imageUrls.length === 0) {
          toast("画像のアップロードに失敗しました")
          return
        }
        const uploadedWork = await updateWork({
          variables: {
            input: {
              id: props.workId,
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
              isTagEditable: isTagEditable ?? false,
              isCommentEditable: isCommentsEditable ?? false,
              thumbnailPosition: isThumbnailLandscape
                ? thumbnailPosX
                : thumbnailPosY,
              modelId: aiUsed ?? 0,
              type: "WORK",
              subjectId: themeId,
              albumId: albumId,
              isPromotion: isAd ?? false,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: accessType,
              imageUrls: imageUrls,
              smallThumbnailImageURL: smallThumbnailUrl,
              smallThumbnailImageWidth: smallThumbnail
                ? smallThumbnail.width
                : work?.work?.smallThumbnailImageWidth ?? 0,
              smallThumbnailImageHeight: smallThumbnail
                ? smallThumbnail.height
                : work?.work?.smallThumbnailImageHeight ?? 0,
              largeThumbnailImageURL: largeThumbnailUrl,
              largeThumbnailImageWidth: largeThumbnail
                ? largeThumbnail.width
                : work?.work?.largeThumbnailImageWidth ?? 0,
              largeThumbnailImageHeight: largeThumbnail
                ? largeThumbnail.height
                : work?.work?.largeThumbnailImageHeight ?? 0,
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
        if (uploadedWork.data?.updateWork) {
          setUploadedWorkId(uploadedWork.data.updateWork.id)
          if (uploadedWork.data.updateWork.accessType === "LIMITED") {
            setUploadedWorkUuid(uploadedWork.data.updateWork.uuid ?? "")
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
        if (url) {
          await deleteUploadedImage(url)
        }
      })
      setProgress(PROGRESS_STEPS.FAILURE) // reset progress on failure
    } finally {
      setIsCreatingWork(false)
    }
  }

  useEffect(() => {
    if (items.map((item) => item.content).length === 0) {
      setPngInfo(null)
    }
  }, [items])

  const selectedImagesByte = () => {
    const totalBytes = items
      .map((item) => item.content)
      .reduce((acc, imageBase64) => {
        const byteLength = new TextEncoder().encode(imageBase64 ?? "").length
        return acc + byteLength
      }, 0)

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    }
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <>
      <div className="relative w-[100%]">
        <div className="mb-4 bg-gray-100 dark:bg-black">
          <div
            // biome-ignore lint/nursery/useSortedClasses: <explanation>
            className={`relative items-center pb-2 bg-gray-800 ${
              isHovered ? "border-2 border-white border-dashed" : ""
            }`}
          >
            {items.map((item) => item.content).length !== 0 && (
              <div className="mb-4 bg-gray-700 p-1 pl-4 dark:bg-blend-darken">
                <div className="flex space-x-4 text-white">
                  <div className="flex">
                    {"イラスト"}
                    {items.map((item) => item.content).length.toString()}
                    {"枚"}
                  </div>
                  <div className="flex">{selectedImagesByte()}</div>
                </div>
              </div>
            )}

            <PostFormItemDraggableImagesAndVideo
              isOnlyMove={true}
              indexList={indexList}
              items={items}
              videoFile={videoFile}
              setItems={setItems}
              setIndexList={setIndexList}
              onChangePngInfo={setPngInfo}
              onVideoChange={(videoFile: File | null) => {
                setVideoFile(videoFile)
              }}
              onMosaicButtonClick={async (content) => {
                // httpsの画像URLならbase64に変換
                if (content.startsWith("https://")) {
                  if (base64Cache[content]) {
                    // Use cached Base64
                    setEditTargetImageBase64(
                      `data:image/webp;base64,${base64Cache[content]}`,
                    )
                  } else {
                    // URLからbase64に変換
                    const base64 = await getBase64FromAipictorsUrl(content)
                    // Update state and cache
                    setEditTargetImageBase64(`data:image/webp;base64,${base64}`)
                    setBase64Cache((prevCache) => ({
                      ...prevCache,
                      [content]: base64,
                    }))
                  }
                  setEditTargetImageUrl(content)
                  return
                }
                setEditTargetImageUrl(content)
                setEditTargetImageBase64(content)
              }}
              onChangeItems={setItems}
              setThumbnailBase64={setThumbnailBase64}
              setOgpBase64={setOgpBase64}
              setIsThumbnailLandscape={setIsThumbnailLandscape}
            />
            {!items.length && (
              <div className="m-4 flex flex-col text-white">
                <p className="text-center text-sm">
                  JPEG、PNG、GIF、WEBP、BMP、MP4
                </p>
                <p className="text-center text-sm">
                  1枚32MB以内、最大200枚、動画は32MB、12秒まで
                </p>
              </div>
            )}
          </div>
          {thumbnailBase64 !== "" && (
            <PostFormItemThumbnailPositionAdjust
              isThumbnailLandscape={isThumbnailLandscape}
              thumbnailBase64={thumbnailBase64}
              thumbnailPosX={thumbnailPosX}
              thumbnailPosY={thumbnailPosY}
              setThumbnailPosX={setThumbnailPosX}
              setThumbnailPosY={setThumbnailPosY}
            />
          )}
          {thumbnailBase64 !== "" && (
            <PostFormOgp
              imageBase64={thumbnailBase64}
              setOgpBase64={setOgpBase64}
              ogpBase64={ogpBase64}
            />
          )}

          <ScrollArea className="p-2">
            <PostFormItemTitle onChange={setTitle} value={title} />
            <PostFormItemCaption caption={caption} setCaption={setCaption} />
            <Accordion type="single" collapsible>
              <AccordionItem value="setting">
                <AccordionTrigger>
                  <Button variant={"secondary"} className="w-full">
                    英語キャプションを入力
                  </Button>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <PostFormItemTitle
                    value={enTitle}
                    label={"英語タイトル"}
                    onChange={setEnTitle}
                  />
                  <PostFormItemCaption
                    label={"英語キャプション"}
                    caption={enCaption}
                    setCaption={setEnCaption}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <PostFormItemRating
              rating={ratingRestriction}
              setRating={setRatingRestriction}
            />
            <PostFormItemView
              accessType={accessType}
              setAccessType={setAccessType}
            />
            <PostFormItemTaste
              imageStyle={imageStyle}
              setImageStyle={setImageStyle}
            />
            <PostFormItemModel
              model={aiUsed ?? 0}
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
                    <PostFormItemGenerationParams
                      pngInfo={pngInfo}
                      setPngInfo={setPngInfo}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <PostFormItemDate
              date={reservationDate}
              time={reservationTime}
              setDate={(value: string) => {
                setReservationDate(value)
                const today = new Date()
                today.setHours(0, 0, 0, 0) // 今日の日付の始まりに時間をセット
                const daysLater = new Date(today)
                daysLater.setDate(today.getDate() + 7) // 7日後の日付を設定

                const changeDate = new Date(value)
                changeDate.setHours(0, 0, 0, 0) // 入力された日付の時間をリセット

                // 入力された日付が今日または未来（今日から7日後まで）である場合のみ更新
                if (changeDate >= today && changeDate <= daysLater) {
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
              <PostFormItemTheme
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
                isChecked={themeId === theme?.dailyTheme?.id}
              />
            )}

            {appEvents && (
              <PostFormItemEvent
                tags={tags}
                setTags={setTags}
                eventName={appEvents?.title ?? ""}
                eventDescription={appEvents?.description ?? ""}
                eventTag={appEvents?.tag ?? ""}
                endAt={appEvents?.endAt ?? 0}
                slug={appEvents?.slug ?? ""}
              />
            )}

            <PostFormItemTags
              whiteListTags={whiteTags}
              tags={tags}
              setTags={setTags}
              recommendedTags={recommendedTags ?? []}
            />

            {recommendedTagsLoading && (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            )}
            <PostFormCategoryEditable
              isChecked={isTagEditable}
              onChange={setIsTagEditable}
            />
            <PostFormCommentsEditable
              isChecked={isCommentsEditable}
              onChange={setIsCommentsEditable}
            />
            <PostFormItemAlbum
              album={albumId}
              albums={optionAlbums}
              setAlbumId={(value: string) => {
                setAlbumId(value)
              }}
            />
            <PostFormItemRelatedLink link={link} onChange={setLink} />
            <PostFormItemAdvertising isChecked={isAd} onChange={setIsAd} />
          </ScrollArea>
        </div>
        <div className="sticky bottom-0 bg-white pb-2 dark:bg-black">
          <Button className="w-full" type="submit" onClick={onPost}>
            更新
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
                  item.content === editTargetImageUrl ||
                  // biome-ignore lint/complexity/useOptionalChain: <explanation>
                  (item.content &&
                    item.content.startsWith("https://") &&
                    item.content === editTargetImageUrl)
                    ? { ...item, content: base64 }
                    : item,
                ),
              )

              console.log("items", items)

              // もし先頭のアイテムを書き換えたならサムネイル更新
              if (
                items[0].content &&
                (items[0].content === editTargetImageUrl ||
                  (items[0].content.startsWith("https://") &&
                    items[0].content !== editTargetImageUrl))
              ) {
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
    </>
  )
}

const albumsQuery = graphql(
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

const appEventsQuery = graphql(
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

const dailyThemeQuery = graphql(
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

const aiModelsQuery = graphql(
  `query AiModels($offset: Int!, $limit: Int!, $where: AiModelWhereInput) {
    aiModels(offset: $offset, limit: $limit, where: $where) {
      ...AiModelFields
    }
  }`,
  [aiModelFieldsFragment],
)

const recommendedTagsFromPromptsQuery = graphql(
  `query RecommendedTagsFromPrompts($prompts: String!) {
    recommendedTagsFromPrompts(prompts: $prompts) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)

const whiteListTagsQuery = graphql(
  `query WhiteListTags($where: WhiteListTagsInput!) {
    whiteListTags(where: $where) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)

const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      token
    }
  }`,
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
