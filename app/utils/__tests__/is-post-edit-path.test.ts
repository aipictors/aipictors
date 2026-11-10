import { describe, expect, test } from "bun:test"
import { isPostEditPath } from "~/utils/is-post-edit-path"

describe("isPostEditPath", () => {
  test("作品の編集ページ", () => {
    expect(isPostEditPath("/posts/123/image/edit")).toBe(true)
    expect(isPostEditPath("/en/posts/123/animation/edit")).toBe(true)
    expect(isPostEditPath("/r/posts/123/text/edit/")).toBe(true)
    expect(isPostEditPath("/r/en/posts/123/image/edit")).toBe(true)
  })

  test("それ以外のページ", () => {
    expect(isPostEditPath("/posts/123")).toBe(false)
    expect(isPostEditPath("/new/image")).toBe(false)
    expect(isPostEditPath("/posts/123/image/edit-history")).toBe(false)
  })
})
