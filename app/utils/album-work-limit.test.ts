import { describe, expect, test } from "bun:test"
import {
  FREE_ALBUM_WORKS_LIMIT,
  getAlbumWorksLimit,
  getAlbumWorksLimitUpgradeTarget,
  LITE_ALBUM_WORKS_LIMIT,
  STANDARD_ALBUM_WORKS_LIMIT,
} from "~/utils/album-work-limit"

describe("album work limit", () => {
  test("free users can add 48 works", () => {
    expect(getAlbumWorksLimit(null)).toBe(FREE_ALBUM_WORKS_LIMIT)
  })

  test("lite users can add 96 works", () => {
    expect(getAlbumWorksLimit("LITE")).toBe(LITE_ALBUM_WORKS_LIMIT)
    expect(getAlbumWorksLimit("TWO_DAYS")).toBe(LITE_ALBUM_WORKS_LIMIT)
  })

  test("standard and premium users can add 120 works", () => {
    expect(getAlbumWorksLimit("STANDARD")).toBe(STANDARD_ALBUM_WORKS_LIMIT)
    expect(getAlbumWorksLimit("PREMIUM")).toBe(STANDARD_ALBUM_WORKS_LIMIT)
  })

  test("returns the next upgrade target", () => {
    expect(getAlbumWorksLimitUpgradeTarget(null)).toEqual({
      passType: "LITE",
      limit: LITE_ALBUM_WORKS_LIMIT,
    })
    expect(getAlbumWorksLimitUpgradeTarget("LITE")).toEqual({
      passType: "STANDARD",
      limit: STANDARD_ALBUM_WORKS_LIMIT,
    })
    expect(getAlbumWorksLimitUpgradeTarget("PREMIUM")).toBeNull()
  })
})
