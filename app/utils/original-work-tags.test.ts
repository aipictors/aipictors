import { describe, expect, test } from "bun:test"
import {
  isOriginalWork,
  ORIGINAL_WORK_TAG_NAMES,
} from "~/utils/original-work-tags"

describe("isOriginalWork", () => {
  test("オリジナル系のタグが付いていれば true", () => {
    expect(isOriginalWork(["女の子", "オリジナル"])).toBe(true)
    expect(isOriginalWork(["オリキャラ"])).toBe(true)
    expect(isOriginalWork(["創作"])).toBe(true)
  })

  test("英語のタグは大文字・小文字を区別しない", () => {
    expect(isOriginalWork(["Original"])).toBe(true)
    expect(isOriginalWork([" ORIGINAL "])).toBe(true)
  })

  test("似ているだけのタグ・二次創作・タグ無しは false", () => {
    expect(isOriginalWork(["二次創作"])).toBe(false)
    expect(isOriginalWork(["オリジナル作品風"])).toBe(false)
    expect(isOriginalWork([])).toBe(false)
    expect(isOriginalWork(null)).toBe(false)
    expect(isOriginalWork(undefined)).toBe(false)
  })

  test("一覧のタグはどれでも一致する", () => {
    for (const name of ORIGINAL_WORK_TAG_NAMES) {
      expect(isOriginalWork([name])).toBe(true)
    }
  })
})
