import type { ResultOf } from "gql.tada"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import type { workQuery } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-queries"
import { getReservationDetails } from "~/utils/get-reservation-details"

export type EditImageWork = NonNullable<ResultOf<typeof workQuery>["work"]>

type MediaInitializeAction = Extract<PostImageFormAction, { type: "INITIALIZE" }>

type InputInitializeAction = Extract<
  PostImageFormInputAction,
  { type: "INITIALIZE" }
>

/**
 * 画像の state の最初の値（作品を読み込む前は空）
 */
export const createEditImageFormState = (
  work: EditImageWork | null,
): PostImageFormState => ({
  videoDurationSeconds: null,
  editTargetImageBase64: null,
  indexList: [],
  isDrawing: false,
  isHovered: false,
  isOpenImageGenerationDialog: false,
  isSelectedGenerationImage: false,
  isThumbnailLandscape:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0),
  items: [
    {
      id: 0,
      content: work?.imageURL ?? "",
    },
    ...(work?.subWorks ?? []).map((subWork, index) => ({
      id: index + 1,
      content: subWork.imageUrl ?? "",
    })),
  ],
  ogpBase64: work?.ogpThumbnailImageUrl ?? "",
  pngInfo: {
    src: work?.pngInfo ?? "",
    params: {
      prompt: work?.prompt ?? "",
      negativePrompt: work?.negativePrompt ?? "",
      seed: work?.seed?.toString() ?? "",
      sampler: work?.sampler ?? "",
      strength: work?.strength ?? "",
      noise: work?.noise ?? "",
      model: work?.model ?? "",
      modelHash: work?.modelHash ?? "",
      steps: work?.steps ? work?.steps.toString() : "",
      scale: work?.scale ? work?.scale.toString() : "",
      vae: "",
    },
  },
  progress: 0,
  selectedImageGenerationIds: [],
  thumbnailBase64: work?.largeThumbnailImageURL ?? "",
  thumbnailPosX:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0)
      ? (work?.thumbnailImagePosition ?? 0)
      : 0,
  thumbnailPosY:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0)
      ? 0
      : (work?.thumbnailImagePosition ?? 0),
  uploadedWorkId: null,
  uploadedWorkUuid: null,
  videoFile: null,
  isOpenLoadingAi: false,
})

/**
 * 読み込んだ作品を画像の state に入れる値
 */
export const toEditImageMediaPayload = (
  work: EditImageWork,
): MediaInitializeAction["payload"] => ({
  items: [
    {
      id: 0,
      content: work?.imageURL ?? "",
    },
    ...(work?.subWorks ?? []).map((subWork, index) => ({
      id: index + 1,
      content: subWork.imageUrl ?? "",
    })),
  ],
  indexList: [],
  isThumbnailLandscape:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0),
  thumbnailBase64: work?.largeThumbnailImageURL ?? "",
  ogpBase64: work?.ogpThumbnailImageUrl ?? "",
  pngInfo: {
    src: work?.pngInfo ?? "",
    params: {
      prompt: work?.prompt ?? "",
      negativePrompt: work?.negativePrompt ?? "",
      seed: work?.seed?.toString() ?? "",
      sampler: work?.sampler ?? "",
      strength: work?.strength ?? "",
      noise: work?.noise ?? "",
      model: work?.model ?? "",
      modelHash: work?.modelHash ?? "",
      steps: work?.steps ? work?.steps.toString() : "",
      scale: work?.scale ? work?.scale.toString() : "",
      vae: "",
    },
  },
  thumbnailPosX:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0)
      ? (work?.thumbnailImagePosition ?? 0)
      : 0,
  thumbnailPosY:
    (work?.smallThumbnailImageWidth ?? 0) >
    (work?.smallThumbnailImageHeight ?? 0)
      ? 0
      : (work?.thumbnailImagePosition ?? 0),
  isSelectedGenerationImage: work?.isGeneration ?? false,
})

/**
 * 読み込んだ作品をフォームの state に入れる値（AI 評価の設定も含む）
 */
export const toEditImageInputPayload = (
  work: EditImageWork,
): InputInitializeAction["payload"] => ({
  accessType: work?.accessType ?? "PUBLIC",
  aiModelId: work?.workModelId?.toString() ?? "1",
  albumId: work?.album?.id ?? null,
  caption: work?.description ?? "",
  date: new Date(work?.createdAt * 1000),
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
  useCommentFeature: work?.isCommentsEditable ?? true,
  useGenerationParams: work?.promptAccessType === "PUBLIC",
  usePromotionFeature: work?.isPromotion ?? false,
  useTagFeature: work?.isTagEditable ?? false,
  correctionMessage: null,
  generationParamAccessType:
    work?.promptAccessType === "PUBLIC" ? "PUBLIC" : "PRIVATE",
  isBotGradingEnabled: Boolean(work?.isBotGradingEnabled ?? false),
  // WorkNodeから直接取得してstateに設定（編集画面用）
  isBotGradingPublic: Boolean(work?.isBotGradingPublic ?? false),
  isBotGradingRankingEnabled: Boolean(
    work?.isBotGradingRankingEnabled ?? false,
  ),
  botPersonality: "pictor_chan" as const,
  botGradingType: "COMMENT_AND_SCORE" as const,
})
