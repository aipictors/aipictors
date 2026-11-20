import { describe, expect, test } from "bun:test"
import {
  columnsToThumbnailSize,
  stepThumbnailSize,
  thumbnailSizeToColumns,
} from "~/routes/($lang).generation._index/utils/thumbnail-columns"

describe("thumbnail-columns", () => {
  test("サイズ 9 は 1 列、7 は 3 列、1 は 9 列", () => {
    expect(thumbnailSizeToColumns(9)).toBe(1)
    expect(thumbnailSizeToColumns(7)).toBe(3)
    expect(thumbnailSizeToColumns(1)).toBe(9)
  })

  test("列数からサイズに戻せる", () => {
    for (let columns = 1; columns <= 9; columns++) {
      expect(thumbnailSizeToColumns(columnsToThumbnailSize(columns))).toBe(
        columns,
      )
    }
  })

  test("範囲外の保存値は 1〜9 列に収める", () => {
    expect(thumbnailSizeToColumns(10)).toBe(1)
    expect(thumbnailSizeToColumns(0)).toBe(9)
  })

  test("◀▶ で 1 列ずつ増減し、端で止まる", () => {
    expect(stepThumbnailSize(7, 1)).toBe(6)
    expect(stepThumbnailSize(7, -1)).toBe(8)
    expect(stepThumbnailSize(9, -1)).toBe(9)
    expect(stepThumbnailSize(1, 1)).toBe(1)
  })
})
