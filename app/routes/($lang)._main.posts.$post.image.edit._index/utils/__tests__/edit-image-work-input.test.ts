import { describe, expect, test } from "bun:test"
import { buildCorrectionMessage } from "~/lib/moderation/moderation-report-guide"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import { createInitialPostImageFormInputState } from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import {
  createEditImageFormState,
  type EditImageWork,
} from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-form-state"
import { toUpdateWorkInput } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-work-input"

const work = {
  id: "1",
  rating: "G",
  smallThumbnailImageWidth: 30,
  smallThumbnailImageHeight: 40,
  largeThumbnailImageWidth: 60,
  largeThumbnailImageHeight: 80,
  moderatorReport: null,
} as unknown as EditImageWork

const props = {
  work,
  form: {
    title: "題",
    caption: "説明",
    enTitle: "title",
    enCaption: "caption",
    imagesCount: 1,
    thumbnailBase64: "https://example.com/t.png",
  },
  inputState: {
    ...createInitialPostImageFormInputState(),
    tags: [{ id: "1", text: "タグ" }],
  } as PostImageFormInputState,
  state: createEditImageFormState(null),
  rating: "G" as const,
  reservedAt: undefined,
  mainImageSha256: "hash",
  mainImageSize: { width: 100, height: 200 },
  imageUrls: ["https://example.com/a.png", "https://example.com/new.png"],
  originalImageUrls: ["https://example.com/a.png", "https://example.com/old.png"],
  smallThumbnail: null,
  smallThumbnailUrl: "small",
  largeThumbnail: null,
  largeThumbnailUrl: "large",
  ogpBase64Url: null,
}

describe("toUpdateWorkInput", () => {
  test("サムネイルを作り直していなければ作品の大きさを送る", () => {
    const input = toUpdateWorkInput(props)
    expect(input.smallThumbnailImageWidth).toBe(30)
    expect(input.smallThumbnailImageHeight).toBe(40)
    expect(input.largeThumbnailImageWidth).toBe(60)
    expect(input.largeThumbnailImageHeight).toBe(80)
  })

  test("作り直したら新しい大きさを送る", () => {
    const input = toUpdateWorkInput({
      ...props,
      smallThumbnail: { width: 1, height: 2 },
      largeThumbnail: { width: 3, height: 4 },
    })
    expect(input.smallThumbnailImageWidth).toBe(1)
    expect(input.smallThumbnailImageHeight).toBe(2)
    expect(input.largeThumbnailImageWidth).toBe(3)
    expect(input.largeThumbnailImageHeight).toBe(4)
  })

  test("修正依頼がなければ修正の報告は送らない", () => {
    expect(toUpdateWorkInput(props).correctionMessage).toBeUndefined()
  })

  test("修正依頼があれば消した枚数と足した枚数を報告に書く", () => {
    const input = toUpdateWorkInput({
      ...props,
      work: {
        ...work,
        moderatorReport: { status: "UNHANDLED" },
      } as unknown as EditImageWork,
    })
    expect(input.correctionMessage).toBe(
      buildCorrectionMessage({
        userMessage: "",
        removedImageCount: 1,
        addedImageCount: 1,
        isRatingChanged: false,
      }),
    )
  })

  test("AI 評価は公開の設定だけ送る", () => {
    const input = toUpdateWorkInput(props)
    expect(input.isBotGradingPublic).toBe(true)
    expect(input.isBotGradingRankingEnabled).toBe(true)
    expect("isBotGradingEnabled" in input).toBe(false)
  })
})
