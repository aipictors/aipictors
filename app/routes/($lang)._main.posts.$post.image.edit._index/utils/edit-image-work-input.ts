import type { InferOutput } from "valibot"
import { buildCorrectionMessage } from "~/lib/moderation/moderation-report-guide"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import type { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import type { EditImageWork } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-form-state"

/**
 * 作品の更新で送る内容
 */
export const toUpdateWorkInput = (props: {
  work: EditImageWork
  form: InferOutput<typeof vPostImageForm>
  inputState: PostImageFormInputState
  state: PostImageFormState
  rating: NonNullable<PostImageFormInputState["ratingRestriction"]>
  reservedAt: number | undefined
  mainImageSha256: string
  mainImageSize: { width: number; height: number }
  imageUrls: string[]
  /**
   * 編集前の画像（修正完了の報告に、何枚消した・足したかを書くため）
   */
  originalImageUrls: string[]
  smallThumbnail: { width: number; height: number } | null
  smallThumbnailUrl: string
  largeThumbnail: { width: number; height: number } | null
  largeThumbnailUrl: string
  ogpBase64Url: string | null
}) => {
  const {
    work,
    form,
    inputState,
    state,
    imageUrls,
    originalImageUrls,
    smallThumbnail,
    largeThumbnail,
  } = props

  return {
  id: work?.id,
  title: form.title,
  entitle: form.enTitle,
  explanation: form.caption,
  enExplanation: form.enCaption,
  rating: props.rating,
  prompt: inputState.imageInformation?.params.prompt ?? null,
  negativePrompt:
    inputState.imageInformation?.params.negativePrompt ?? null,
  seed: inputState.imageInformation?.params.seed?.toString() ?? null,
  sampler: inputState.imageInformation?.params.sampler ?? null,
  strength: inputState.imageInformation?.params.strength ?? null,
  noise: inputState.imageInformation?.params.noise ?? null,
  modelName: inputState.imageInformation?.params.model ?? null,
  modelHash: inputState.imageInformation?.params.modelHash ?? null,
  otherGenerationParams: inputState.imageInformation?.src ?? null,
  pngInfo: inputState.imageInformation?.src ?? null,
  imageStyle: inputState.imageStyle,
  relatedUrl: inputState.link,
  tags: inputState.tags.map((tag: { text: string }) => tag.text),
  isTagEditable: inputState.useTagFeature,
  isCommentEditable: inputState.useCommentFeature,
  thumbnailPosition: state.isThumbnailLandscape
    ? state.thumbnailPosX
    : state.thumbnailPosY,
  modelId: inputState.aiModelId,
  type: "WORK" as const,
  subjectId: inputState.themeId,
  albumId: inputState.albumId,
  isPromotion: inputState.usePromotionFeature,
  reservedAt: props.reservedAt,
  mainImageSha256: props.mainImageSha256,
  accessType: inputState.accessType,
  imageUrls,
  smallThumbnailImageURL: props.smallThumbnailUrl,
  smallThumbnailImageWidth: smallThumbnail
    ? smallThumbnail.width
    : (work.smallThumbnailImageWidth ?? 0),
  smallThumbnailImageHeight: smallThumbnail
    ? smallThumbnail.height
    : (work.smallThumbnailImageHeight ?? 0),
  largeThumbnailImageURL: props.largeThumbnailUrl,
  largeThumbnailImageWidth: largeThumbnail
    ? largeThumbnail.width
    : (work.largeThumbnailImageWidth ?? 0),
  largeThumbnailImageHeight: largeThumbnail
    ? largeThumbnail.height
    : (work.largeThumbnailImageHeight ?? 0),
  videoUrl: null,
  ogpImageUrl: props.ogpBase64Url,
  imageHeight: props.mainImageSize.height,
  imageWidth: props.mainImageSize.width,
  accessGenerationType:
    state.isSelectedGenerationImage && inputState.useGenerationParams
      ? ("PUBLIC_RESTORABLE" as const)
      : inputState.useGenerationParams
        ? ("PUBLIC" as const)
        : ("PRIVATE" as const),
  // 修正依頼が来ている作品は、保存すると運営に修正完了が自動で届く（文は書かなくてよい）
  correctionMessage:
    work?.moderatorReport?.status === "UNHANDLED"
      ? buildCorrectionMessage({
          userMessage: inputState.correctionMessage ?? "",
          removedImageCount: originalImageUrls.filter(
            (url) => !imageUrls.includes(url),
          ).length,
          addedImageCount: imageUrls.filter(
            (url) => !originalImageUrls.includes(url),
          ).length,
          isRatingChanged:
            (work?.rating ?? null) !== inputState.ratingRestriction,
        })
      : undefined,
  // AI評価設定を含める
  isBotGradingPublic: inputState.isBotGradingPublic,
  isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
  }
}
