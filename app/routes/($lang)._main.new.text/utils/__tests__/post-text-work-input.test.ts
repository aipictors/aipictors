import { describe, expect, test } from "bun:test"
import type { PostTextFormInputState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-input-state"
import type { PostTextFormState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-state"
import { toTextWorkInput } from "~/routes/($lang)._main.new.text/utils/post-text-work-input"

const inputState = {
  accessType: "PUBLIC",
  generationParamAccessType: "PUBLIC",
  aiModelId: "1",
  albumId: null,
  caption: "",
  isCaptionBeforeBody: false,
  date: new Date(),
  enCaption: "",
  enTitle: "",
  imageInformation: null,
  imageStyle: "ILLUSTRATION",
  link: "",
  ratingRestriction: "G",
  reservationDate: null,
  reservationTime: null,
  tags: [{ id: "1", text: "タグ" }],
  themeId: null,
  title: "",
  useCommentFeature: true,
  useGenerationParams: true,
  usePromotionFeature: false,
  useTagFeature: true,
  md: "",
  type: "NOVEL",
  correctionMessage: "",
} satisfies PostTextFormInputState

const state = {
  editTargetImageBase64: null,
  indexList: [],
  isDrawing: false,
  isHovered: false,
  isOpenImageGenerationDialog: false,
  isSelectedGenerationImage: false,
  isThumbnailLandscape: false,
  items: [],
  ogpBase64: null,
  pngInfo: null,
  progress: 0,
  selectedImageGenerationIds: [],
  thumbnailBase64: null,
  thumbnailPosX: 11,
  thumbnailPosY: 22,
  uploadedWorkId: null,
  uploadedWorkUuid: null,
  videoFile: null,
  isOpenLoadingAi: false,
} satisfies PostTextFormState

const props = {
  form: {
    title: "題",
    caption: "説明",
    enTitle: "title",
    enCaption: "caption",
    imagesCount: 1,
    thumbnailBase64: "base64",
    md: "本文",
  },
  inputState,
  state,
  reservedAt: undefined,
  mainImageSha256: "hash",
  mainImageSize: { width: 100, height: 200 },
  imageUrls: ["main"],
  smallThumbnail: { width: 1, height: 2 },
  smallThumbnailUrl: "small",
  largeThumbnail: { width: 3, height: 4 },
  largeThumbnailUrl: "large",
  ogpBase64Url: null,
  mdUrl: "md",
}

describe("toTextWorkInput", () => {
  test("本文の URL と種類を送る", () => {
    const input = toTextWorkInput(props)
    expect(input.mdUrl).toBe("md")
    expect(input.type).toBe("NOVEL")
    expect(input.videoUrl).toBeNull()
    expect(input.title).toBe("題")
    expect(input.tags).toEqual(["タグ"])
    expect(input.thumbnailPosition).toBe(22)
  })

  test("生成の情報は pngInfo から読む", () => {
    const input = toTextWorkInput({
      ...props,
      state: {
        ...state,
        isThumbnailLandscape: true,
        isSelectedGenerationImage: true,
        pngInfo: {
          src: "png",
          params: {
            prompt: "p",
            negativePrompt: "n",
            seed: "1",
            sampler: "s",
            strength: "",
            noise: "",
            model: "m",
            modelHash: "h",
            steps: "2",
            scale: "3",
            vae: "",
          },
        },
      },
    })
    expect(input.prompt).toBe("p")
    expect(input.otherGenerationParams).toBe("png")
    expect(input.pngInfo).toBe("png")
    expect(input.thumbnailPosition).toBe(11)
    expect(input.accessGenerationType).toBe("PUBLIC_RESTORABLE")
  })

  test("生成情報を使わないときは非公開", () => {
    expect(
      toTextWorkInput({
        ...props,
        inputState: { ...inputState, useGenerationParams: false },
      }).accessGenerationType,
    ).toBe("PRIVATE")
  })

  test("キャプションを本文の前に出すかを送る（既定は本文の後）", () => {
    expect(toTextWorkInput(props).isCaptionBeforeBody).toBe(false)
    expect(
      toTextWorkInput({
        ...props,
        inputState: { ...inputState, isCaptionBeforeBody: true },
      }).isCaptionBeforeBody,
    ).toBe(true)
  })
})
