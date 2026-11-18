import { describe, expect, test } from "bun:test"
import {
  FILE_DROP_ZONE_ATTRIBUTE,
  isInsideFileDropZone,
  pickFirstImageFile,
} from "~/utils/file-drop-zone"

const element = (insideZone: boolean) => ({
  closest: (selector: string) =>
    insideZone && selector === `[${FILE_DROP_ZONE_ATTRIBUTE}]` ? {} : null,
})

describe("isInsideFileDropZone", () => {
  test("ドロップ領域の中なら true", () => {
    expect(isInsideFileDropZone(element(true))).toBe(true)
  })

  test("ドロップ領域の外なら false", () => {
    expect(isInsideFileDropZone(element(false))).toBe(false)
  })

  test("要素でない対象（document やテキスト）は false", () => {
    expect(isInsideFileDropZone(null)).toBe(false)
    expect(isInsideFileDropZone({})).toBe(false)
    expect(isInsideFileDropZone("text")).toBe(false)
  })
})

describe("pickFirstImageFile", () => {
  test("画像以外を飛ばして最初の画像を返す", () => {
    const text = new File(["a"], "a.txt", { type: "text/plain" })
    const png = new File(["b"], "b.png", { type: "image/png" })
    const jpg = new File(["c"], "c.jpg", { type: "image/jpeg" })
    expect(pickFirstImageFile([text, png, jpg])).toBe(png)
  })

  test("画像がなければ null", () => {
    const text = new File(["a"], "a.txt", { type: "text/plain" })
    expect(pickFirstImageFile([text])).toBeNull()
    expect(pickFirstImageFile(null)).toBeNull()
  })
})
