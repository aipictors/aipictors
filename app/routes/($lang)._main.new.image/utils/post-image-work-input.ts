import type { InferOutput } from "valibot"
import type { VariablesOf } from "gql.tada"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import type { CreateWorkMutation } from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import type { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"

type CreateWorkInput = VariablesOf<typeof CreateWorkMutation>["input"]

type Thumbnail = { width: number; height: number }

type CommonProps = {
  form: InferOutput<typeof vPostImageForm>
  inputState: PostImageFormInputState
  state: PostImageFormState
  reservedAt: number | undefined
  mainImageSha256: string
  mainImageSize: { width: number; height: number }
  smallThumbnail: Thumbnail
  largeThumbnail: Thumbnail
}

/**
 * 動画の投稿で送る内容
 */
export const toVideoWorkInput = (
  props: CommonProps & {
    thumbnailUrl: string
    smallThumbnailUrl: string
    largeThumbnailUrl: string
    ogpBase64Url: string | null
    uploadedVideo: { url: string; uid: string | null }
  },
): CreateWorkInput => {
  const { form, inputState, state } = props

  return {
    title: form.title,
    entitle: form.enTitle,
    explanation: form.caption,
    enExplanation: form.enCaption,
    rating: inputState.ratingRestriction || "G",
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
    reservedAt: props.reservedAt,
    mainImageSha256: props.mainImageSha256,
    accessType: inputState.accessType,
    imageUrls: [props.thumbnailUrl],
    smallThumbnailImageURL: props.smallThumbnailUrl,
    smallThumbnailImageWidth: props.smallThumbnail.width,
    smallThumbnailImageHeight: props.smallThumbnail.height,
    largeThumbnailImageURL: props.largeThumbnailUrl,
    largeThumbnailImageWidth: props.largeThumbnail.width,
    largeThumbnailImageHeight: props.largeThumbnail.height,
    videoUrl: props.uploadedVideo.url,
    videoDurationSeconds: state.videoDurationSeconds,
    streamUid: props.uploadedVideo.uid,
    ogpImageUrl: props.ogpBase64Url,
    imageHeight: props.mainImageSize.height,
    imageWidth: props.mainImageSize.width,
    accessGenerationType: "PUBLIC",
  }
}

/**
 * 画像の投稿で送る内容
 *
 * uploadedImageUrls は順に小サムネイル・大サムネイル・OGP（なければ空文字）・AI 評価用・本体の画像
 */
export const toImageWorkInput = (
  props: CommonProps & { uploadedImageUrls: string[] },
): CreateWorkInput => {
  const { form, inputState, state, uploadedImageUrls } = props

  return {
    title: form.title,
    entitle: form.enTitle,
    explanation: form.caption,
    enExplanation: form.enCaption,
    rating: inputState.ratingRestriction || "G",
    prompt: inputState.imageInformation?.params.prompt ?? null,
    negativePrompt:
      inputState.imageInformation?.params.negativePrompt ?? null,
    seed:
      inputState.imageInformation?.params.seed?.toString() ?? null,
    sampler:
      inputState.imageInformation?.params.sampler?.toString() ?? null,
    strength:
      inputState.imageInformation?.params.strength?.toString() ??
      null,
    noise:
      inputState.imageInformation?.params.noise?.toString() ?? null,
    modelName: inputState.imageInformation?.params.model ?? null,
    modelHash:
      inputState.imageInformation?.params.modelHash?.toString() ??
      null,
    otherGenerationParams: null,
    pngInfo: inputState.imageInformation?.src ?? null,
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
    reservedAt: props.reservedAt,
    mainImageSha256: props.mainImageSha256,
    accessType: inputState.accessType,
    imageUrls: uploadedImageUrls.slice(4), // 最初の4つを除外（thumbnails, ogp, botGradingImage）
    smallThumbnailImageURL: uploadedImageUrls[0],
    smallThumbnailImageWidth: props.smallThumbnail.width,
    smallThumbnailImageHeight: props.smallThumbnail.height,
    largeThumbnailImageURL: uploadedImageUrls[1],
    largeThumbnailImageWidth: props.largeThumbnail.width,
    largeThumbnailImageHeight: props.largeThumbnail.height,
    videoUrl: null,
    ogpImageUrl:
      uploadedImageUrls[2] !== "" ? uploadedImageUrls[2] : null,
    imageHeight: props.mainImageSize.height,
    imageWidth: props.mainImageSize.width,
    accessGenerationType:
      state.isSelectedGenerationImage &&
      inputState.useGenerationParams
        ? "PUBLIC_RESTORABLE"
        : inputState.useGenerationParams
          ? "PUBLIC"
          : "PRIVATE",
    isBotGradingEnabled: inputState.isBotGradingEnabled,
    isBotGradingPublic: inputState.isBotGradingPublic,
    isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
    botPersonality: inputState.botPersonality,
    botGradingImageUrl: uploadedImageUrls[3],
    botGradingType: inputState.botGradingType,
  }
}
