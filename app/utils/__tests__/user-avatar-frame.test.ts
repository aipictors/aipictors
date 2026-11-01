import { describe, expect, test } from "bun:test"
import {
  isUserAvatarDecoration,
  toUserAvatarDecorationAnimatedUrl,
  toUserAvatarFrameCategory,
} from "~/utils/user-avatar-frame"

describe("アイコンの装飾", () => {
  test("動く絵の URL を作る（バージョンのクエリは残す）", () => {
    expect(toUserAvatarDecorationAnimatedUrl("/avatar-frames/deco/sakura.webp?v=1")).toBe(
      "/avatar-frames/deco/sakura.anim.webp?v=1",
    )
    expect(toUserAvatarDecorationAnimatedUrl("/avatar-frames/deco/sakura.webp")).toBe(
      "/avatar-frames/deco/sakura.anim.webp",
    )
  })

  test("分類は slug から決まり、知らないものはシンプルに入る", () => {
    expect(toUserAvatarFrameCategory("deco-cute-cat-pink")).toBe("cute")
    expect(toUserAvatarFrameCategory("animated-rainbow")).toBe("basic")
    expect(toUserAvatarFrameCategory("deco-unknown-x")).toBe("basic")
  })

  test("装飾かどうか", () => {
    expect(isUserAvatarDecoration({ frameType: "DECORATION" })).toBe(true)
    expect(isUserAvatarDecoration({ frameType: "GRADIENT" })).toBe(false)
    expect(isUserAvatarDecoration(null)).toBe(false)
  })
})
