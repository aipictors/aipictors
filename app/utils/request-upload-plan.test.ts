import { describe, expect, test } from "bun:test"
import {
  toRequestRawUploadType,
  toRequestUploadPlan,
} from "~/utils/request-upload-plan"

const MB = 1024 * 1024

describe("リクエストの画像欄に選んだファイルの送り方", () => {
  test("納品では GIF アニメを変換せずそのまま送る（1 コマ目だけにならない）", () => {
    expect(toRequestUploadPlan({ type: "image/gif", size: 5 * MB }, true)).toBe(
      "raw",
    )
  })

  test("納品では mp4・webm・mov の動画も送れる", () => {
    for (const type of ["video/mp4", "video/webm", "video/quicktime"]) {
      expect(toRequestUploadPlan({ type, size: 10 * MB }, true)).toBe("raw")
    }
  })

  test("32MB を超える GIF・動画は送れない", () => {
    expect(
      toRequestUploadPlan({ type: "video/mp4", size: 33 * MB }, true),
    ).toBe("too-large")
  })

  test("静止画はこれまでどおり webp に変換する", () => {
    expect(toRequestUploadPlan({ type: "image/png", size: MB }, true)).toBe(
      "convert",
    )
  })

  test("納品ではアニメーションの PNG・WebP もそのまま送る（メッセージ欄では静止画）", () => {
    for (const type of ["image/png", "image/webp"]) {
      expect(
        toRequestUploadPlan({ type, size: MB, isAnimated: true }, true),
      ).toBe("raw")
      expect(
        toRequestUploadPlan({ type, size: 33 * MB, isAnimated: true }, true),
      ).toBe("too-large")
      expect(
        toRequestUploadPlan({ type, size: MB, isAnimated: true }, false),
      ).toBe("convert")
    }
  })

  test("メッセージ・参考画像の欄では GIF は静止画にし、動画は送れない", () => {
    expect(toRequestUploadPlan({ type: "image/gif", size: MB }, false)).toBe(
      "convert",
    )
    expect(toRequestUploadPlan({ type: "video/mp4", size: MB }, false)).toBe(
      "unsupported",
    )
  })
})

describe("type が空のファイル（一部の端末の動画）", () => {
  test("拡張子が mp4・mov・webm なら納品では動画としてそのまま送る", () => {
    for (const name of ["a.mp4", "b.MOV", "c.webm"]) {
      expect(toRequestUploadPlan({ type: "", size: MB, name }, true)).toBe(
        "raw",
      )
    }
  })

  test("静止画だけの欄では送れない扱いにする", () => {
    expect(
      toRequestUploadPlan({ type: "", size: MB, name: "a.mp4" }, false),
    ).toBe("unsupported")
  })

  test("送るときの Content-Type を拡張子から決める", () => {
    expect(toRequestRawUploadType({ type: "", name: "a.MOV" })).toBe(
      "video/quicktime",
    )
    expect(toRequestRawUploadType({ type: "", name: "a.webm" })).toBe(
      "video/webm",
    )
    expect(toRequestRawUploadType({ type: "video/mp4", name: "x" })).toBe(
      "video/mp4",
    )
  })
})
