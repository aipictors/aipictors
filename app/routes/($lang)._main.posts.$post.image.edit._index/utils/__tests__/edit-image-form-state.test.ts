import { describe, expect, test } from "bun:test"
import {
  createEditImageFormState,
  type EditImageWork,
  toEditImageInputPayload,
  toEditImageMediaPayload,
} from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-form-state"

const work = {
  id: "1",
  title: "題",
  description: "説明",
  enTitle: null,
  enDescription: null,
  accessType: "LIMITED",
  promptAccessType: "PRIVATE",
  rating: "R15",
  style: "REAL",
  imageURL: "https://example.com/main.png",
  subWorks: [{ id: "2", imageUrl: "https://example.com/sub.png" }],
  largeThumbnailImageURL: "https://example.com/large.png",
  smallThumbnailImageWidth: 300,
  smallThumbnailImageHeight: 400,
  thumbnailImagePosition: 12,
  ogpThumbnailImageUrl: null,
  tagNames: ["a"],
  createdAt: 1767225600,
  workModelId: 7,
  seed: 9,
  steps: 20,
  scale: 0,
  isBotGradingEnabled: true,
  isBotGradingPublic: null,
  isBotGradingRankingEnabled: null,
  isTagEditable: null,
  isCommentsEditable: null,
  isGeneration: true,
} as unknown as EditImageWork

describe("createEditImageFormState", () => {
  test("読み込む前は空の 1 枚", () => {
    const state = createEditImageFormState(null)
    expect(state.items).toEqual([{ id: 0, content: "" }])
    expect(state.progress).toBe(0)
    expect(state.isThumbnailLandscape).toBe(false)
  })
})

describe("toEditImageMediaPayload", () => {
  test("本体とサブ画像を順に並べる", () => {
    expect(toEditImageMediaPayload(work).items).toEqual([
      { id: 0, content: "https://example.com/main.png" },
      { id: 1, content: "https://example.com/sub.png" },
    ])
  })

  test("縦長はサムネイルの位置を Y に入れる", () => {
    const payload = toEditImageMediaPayload(work)
    expect(payload.isThumbnailLandscape).toBe(false)
    expect(payload.thumbnailPosX).toBe(0)
    expect(payload.thumbnailPosY).toBe(12)
  })

  test("横長はサムネイルの位置を X に入れる", () => {
    const payload = toEditImageMediaPayload({
      ...work,
      smallThumbnailImageWidth: 800,
    })
    expect(payload.isThumbnailLandscape).toBe(true)
    expect(payload.thumbnailPosX).toBe(12)
    expect(payload.thumbnailPosY).toBe(0)
  })

  test("0 の Steps や Scale は空にする", () => {
    const params = toEditImageMediaPayload(work).pngInfo?.params
    expect(params?.steps).toBe("20")
    expect(params?.scale).toBe("")
    expect(params?.seed).toBe("9")
  })
})

describe("toEditImageInputPayload", () => {
  test("作品の値を入れる", () => {
    const payload = toEditImageInputPayload(work)
    expect(payload.title).toBe("題")
    expect(payload.enTitle).toBe("")
    expect(payload.accessType).toBe("LIMITED")
    expect(payload.ratingRestriction).toBe("R15")
    expect(payload.aiModelId).toBe("7")
    expect(payload.tags).toEqual([{ id: "a", text: "a" }])
    expect(payload.date.getTime()).toBe(1767225600000)
  })

  test("プロンプトが非公開なら生成情報の公開を切る", () => {
    const payload = toEditImageInputPayload(work)
    expect(payload.useGenerationParams).toBe(false)
    expect(payload.generationParamAccessType).toBe("PRIVATE")
  })

  test("AI 評価の設定は null を切ったものとして読む", () => {
    const payload = toEditImageInputPayload(work)
    expect(payload.isBotGradingEnabled).toBe(true)
    expect(payload.isBotGradingPublic).toBe(false)
    expect(payload.isBotGradingRankingEnabled).toBe(false)
  })

  test("未設定の編集許可は既定に合わせる", () => {
    const payload = toEditImageInputPayload(work)
    expect(payload.useCommentFeature).toBe(true)
    expect(payload.useTagFeature).toBe(false)
  })
})
