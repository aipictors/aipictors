import { describe, expect, test } from "bun:test"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import {
  createInitialPostImageFormInputState,
  INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
} from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import {
  toImageWorkInput,
  toVideoWorkInput,
} from "~/routes/($lang)._main.new.image/utils/post-image-work-input"

const inputState = {
  ...createInitialPostImageFormInputState(),
  tags: [{ id: "1", text: "タグ" }],
} as PostImageFormInputState

const state: PostImageFormState = {
  ...INITIAL_POST_IMAGE_FORM_MEDIA_STATE,
  editTargetImageBase64: null,
  isDrawing: false,
  isHovered: false,
  isOpenImageGenerationDialog: false,
  isOpenLoadingAi: false,
  progress: 0,
  selectedImageGenerationIds: [],
  uploadedWorkId: null,
  uploadedWorkUuid: null,
  videoFile: null,
  videoDurationSeconds: null,
  thumbnailPosX: 11,
  thumbnailPosY: 22,
}

const common = {
  form: {
    title: "題",
    caption: "説明",
    enTitle: "title",
    enCaption: "caption",
    imagesCount: 1,
    thumbnailBase64: "base64",
  },
  inputState,
  state,
  reservedAt: undefined,
  mainImageSha256: "hash",
  mainImageSize: { width: 100, height: 200 },
  smallThumbnail: { width: 1, height: 2 },
  largeThumbnail: { width: 3, height: 4 },
}

describe("toImageWorkInput", () => {
  const urls = ["small", "large", "ogp", "bot", "main", "sub"]

  test("アップロードした URL を順に割り当てる", () => {
    const input = toImageWorkInput({ ...common, uploadedImageUrls: urls })
    expect(input.smallThumbnailImageURL).toBe("small")
    expect(input.largeThumbnailImageURL).toBe("large")
    expect(input.ogpImageUrl).toBe("ogp")
    expect(input.botGradingImageUrl).toBe("bot")
    expect(input.imageUrls).toEqual(["main", "sub"])
    expect(input.tags).toEqual(["タグ"])
    expect(input.title).toBe("題")
    expect(input.entitle).toBe("title")
  })

  test("OGP がないときは null", () => {
    const input = toImageWorkInput({
      ...common,
      uploadedImageUrls: ["small", "large", "", "bot", "main"],
    })
    expect(input.ogpImageUrl).toBeNull()
  })

  test("サムネイルの位置は縦長か横長かで決まる", () => {
    expect(
      toImageWorkInput({ ...common, uploadedImageUrls: urls }).thumbnailPosition,
    ).toBe(22)
    expect(
      toImageWorkInput({
        ...common,
        state: { ...state, isThumbnailLandscape: true },
        uploadedImageUrls: urls,
      }).thumbnailPosition,
    ).toBe(11)
  })

  test("生成情報の公開範囲", () => {
    const access = (
      isSelectedGenerationImage: boolean,
      useGenerationParams: boolean,
    ) =>
      toImageWorkInput({
        ...common,
        state: { ...state, isSelectedGenerationImage },
        inputState: { ...inputState, useGenerationParams },
        uploadedImageUrls: urls,
      }).accessGenerationType
    expect(access(true, true)).toBe("PUBLIC_RESTORABLE")
    expect(access(false, true)).toBe("PUBLIC")
    expect(access(true, false)).toBe("PRIVATE")
  })
})

describe("toVideoWorkInput", () => {
  test("生成情報は送らず、動画とサムネイルを送る", () => {
    const input = toVideoWorkInput({
      ...common,
      state: { ...state, videoDurationSeconds: 12 },
      thumbnailUrl: "thumb",
      smallThumbnailUrl: "small",
      largeThumbnailUrl: "large",
      ogpBase64Url: null,
      uploadedVideo: { url: "video", uid: "uid" },
    })
    expect(input.prompt).toBeNull()
    expect(input.pngInfo).toBeNull()
    expect(input.imageUrls).toEqual(["thumb"])
    expect(input.videoUrl).toBe("video")
    expect(input.streamUid).toBe("uid")
    expect(input.videoDurationSeconds).toBe(12)
    expect(input.accessGenerationType).toBe("PUBLIC")
  })
})
