import type { VariablesOf } from "gql.tada"
import type { InferOutput } from "valibot"
import type { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"
import type { PostTextFormInputState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-input-state"
import type { PostTextFormState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-state"
import type { CreateWorkMutation } from "~/routes/($lang)._main.new.text/utils/new-text-queries"

/**
 * 小説・コラムの投稿で送る内容
 */
export const toTextWorkInput = (props: {
  form: InferOutput<typeof vPostTextForm>
  inputState: PostTextFormInputState
  state: PostTextFormState
  reservedAt: number | undefined
  mainImageSha256: string
  mainImageSize: { width: number; height: number }
  imageUrls: string[]
  smallThumbnail: { width: number; height: number }
  smallThumbnailUrl: string
  largeThumbnail: { width: number; height: number }
  largeThumbnailUrl: string
  ogpBase64Url: string | null
  mdUrl: string
}): VariablesOf<typeof CreateWorkMutation>["input"] => {
  const { form, inputState, state } = props

  return {
    title: form.title,
    entitle: form.enTitle,
    explanation: form.caption,
    isCaptionBeforeBody: inputState.isCaptionBeforeBody,
    enExplanation: form.enCaption,
    rating: inputState.ratingRestriction,
    prompt: state.pngInfo?.params.prompt ?? null,
    negativePrompt: state.pngInfo?.params.negativePrompt ?? null,
    seed: state.pngInfo?.params.seed?.toString() ?? null,
    sampler: state.pngInfo?.params.sampler?.toString() ?? null,
    strength: state.pngInfo?.params.strength?.toString() ?? null,
    noise: state.pngInfo?.params.noise?.toString() ?? null,
    modelName: state.pngInfo?.params.model ?? null,
    modelHash: state.pngInfo?.params.modelHash?.toString() ?? null,
    otherGenerationParams: state.pngInfo?.src ?? null,
    pngInfo: state.pngInfo?.src ?? null,
    imageStyle: inputState.imageStyle,
    relatedUrl: inputState.link,
    tags: inputState.tags.map((tag) => tag.text),
    isTagEditable: inputState.useTagFeature,
    isCommentEditable: inputState.useCommentFeature,
    thumbnailPosition: state.isThumbnailLandscape
      ? state.thumbnailPosX
      : state.thumbnailPosY,
    modelId: inputState.aiModelId,
    type: inputState.type ?? "COLUMN",
    subjectId: inputState.themeId,
    albumId: inputState.albumId,
    isPromotion: inputState.usePromotionFeature,
    reservedAt: props.reservedAt,
    mainImageSha256: props.mainImageSha256,
    accessType: inputState.accessType,
    imageUrls: props.imageUrls,
    smallThumbnailImageURL: props.smallThumbnailUrl,
    smallThumbnailImageWidth: props.smallThumbnail.width,
    smallThumbnailImageHeight: props.smallThumbnail.height,
    largeThumbnailImageURL: props.largeThumbnailUrl,
    largeThumbnailImageWidth: props.largeThumbnail.width,
    largeThumbnailImageHeight: props.largeThumbnail.height,
    videoUrl: null,
    ogpImageUrl: props.ogpBase64Url,
    imageHeight: props.mainImageSize.height,
    imageWidth: props.mainImageSize.width,
    accessGenerationType:
      state.isSelectedGenerationImage && inputState.useGenerationParams
        ? "PUBLIC_RESTORABLE"
        : inputState.useGenerationParams
          ? "PUBLIC"
          : "PRIVATE",
    mdUrl: props.mdUrl,
  }
}
