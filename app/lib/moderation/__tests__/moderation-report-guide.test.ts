import { expect, test } from "bun:test"
import {
  buildCorrectionMessage,
  getModerationReportGuide,
} from "~/lib/moderation/moderation-report-guide"

test("区分の変更は直す必要がない、モザイクは直す必要がある", () => {
  expect(getModerationReportGuide("INAPPROPRIATE_RATING").needsFix).toBe(false)
  expect(getModerationReportGuide("NEED_MOSAIC").needsFix).toBe(true)
  expect(getModerationReportGuide("NEED_MOSAIC").suggestsMosaic).toBe(true)
  expect(getModerationReportGuide(null).needsFix).toBe(true)
})

test("修正完了の報告文を自動で作る", () => {
  expect(
    buildCorrectionMessage({
      userMessage: "",
      removedImageCount: 1,
      addedImageCount: 0,
      isRatingChanged: false,
    }),
  ).toBe("画像を1枚削除しました")
  expect(
    buildCorrectionMessage({
      userMessage: "3枚目を差し替えました",
      removedImageCount: 1,
      addedImageCount: 1,
      isRatingChanged: true,
    }),
  ).toBe(
    "3枚目を差し替えました（画像を1枚削除しました・画像を1枚追加・差し替えました・年齢区分を変更しました）",
  )
  expect(
    buildCorrectionMessage({
      userMessage: "",
      removedImageCount: 0,
      addedImageCount: 0,
      isRatingChanged: false,
    }),
  ).toBe("編集画面から作品を修正しました")
})
