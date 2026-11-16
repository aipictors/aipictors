import { describe, expect, test } from "bun:test"
import {
  filterUserAvatarFrames,
  isPlanExclusiveUserAvatarFrame,
  isSpecialUserAvatarFrame,
  isUserAvatarDecoration,
  toUserAvatarDecorationAnimatedUrl,
  toUserAvatarDecorationSrcSet,
  toUserAvatarFrameAccess,
  toUserAvatarFrameCategory,
} from "~/utils/user-avatar-frame"

describe("アイコンの装飾", () => {
  test("動く絵の URL を作る（バージョンのクエリは残す）", () => {
    expect(
      toUserAvatarDecorationAnimatedUrl("/avatar-frames/deco/sakura.webp?v=1"),
    ).toBe("/avatar-frames/deco/sakura.anim.webp?v=1")
    expect(
      toUserAvatarDecorationAnimatedUrl("/avatar-frames/deco/sakura.webp"),
    ).toBe("/avatar-frames/deco/sakura.anim.webp")
  })

  test("分類は slug から決まり、知らないものはシンプルに入る", () => {
    expect(toUserAvatarFrameCategory("deco-cute-cat-pink")).toBe("cute")
    expect(toUserAvatarFrameCategory("animated-rainbow")).toBe("basic")
    expect(toUserAvatarFrameCategory("deco-unknown-x")).toBe("basic")
  })

  test("プラン限定の枠は slug で見分ける", () => {
    expect(toUserAvatarFrameCategory("deco-plan-premium-crown")).toBe("plan")
    expect(isPlanExclusiveUserAvatarFrame("deco-plan-lite-silver")).toBe(true)
    expect(isPlanExclusiveUserAvatarFrame("deco-fantasy-crown")).toBe(false)
  })

  test("スペシャル・スイーツ・かっこいいの枠も slug で分ける", () => {
    expect(toUserAvatarFrameCategory("deco-special-seraph")).toBe("special")
    expect(isSpecialUserAvatarFrame("deco-special-jewels")).toBe(true)
    expect(isSpecialUserAvatarFrame("deco-plan-premium-crown")).toBe(false)
    expect(toUserAvatarFrameCategory("deco-sweets-shortcake")).toBe("sweets")
    expect(toUserAvatarFrameCategory("deco-cool-phoenix")).toBe("cool")
  })

  test("装飾かどうか", () => {
    expect(isUserAvatarDecoration({ frameType: "DECORATION" })).toBe(true)
    expect(isUserAvatarDecoration({ frameType: "GRADIENT" })).toBe(false)
    expect(isUserAvatarDecoration(null)).toBe(false)
  })
})

describe("サブスクの枠とコインの枠", () => {
  const plan = {
    id: "1",
    slug: "deco-cute-a",
    requiredPassType: "LITE",
    priceCoins: null,
  }
  const coin = {
    id: "2",
    slug: "deco-wa-b",
    requiredPassType: "LITE",
    priceCoins: 500,
  }

  test("上位プランの枠は、そのプラン以上でないと使えない", () => {
    const premium = {
      id: "3",
      slug: "deco-plan-premium-crown",
      requiredPassType: "PREMIUM",
      priceCoins: null,
    }
    const standard = {
      id: "4",
      slug: "deco-plan-standard-laurel",
      requiredPassType: "STANDARD",
      priceCoins: null,
    }
    expect(
      toUserAvatarFrameAccess(premium, {
        currentPassType: "STANDARD",
        ownedFrameIds: [],
      }),
    ).toBe("NEEDS_PLAN")
    expect(
      toUserAvatarFrameAccess(premium, {
        currentPassType: "PREMIUM",
        ownedFrameIds: [],
      }),
    ).toBe("AVAILABLE")
    expect(
      toUserAvatarFrameAccess(standard, {
        currentPassType: "LITE",
        ownedFrameIds: [],
      }),
    ).toBe("NEEDS_PLAN")
    expect(
      toUserAvatarFrameAccess(standard, {
        currentPassType: "PREMIUM",
        ownedFrameIds: [],
      }),
    ).toBe("AVAILABLE")
  })

  test("サブスクの枠はプランの間だけ", () => {
    expect(
      toUserAvatarFrameAccess(plan, {
        currentPassType: "LITE",
        ownedFrameIds: [],
      }),
    ).toBe("AVAILABLE")
    expect(
      toUserAvatarFrameAccess(plan, {
        currentPassType: null,
        ownedFrameIds: [],
      }),
    ).toBe("NEEDS_PLAN")
  })

  test("コインの枠はプランがあっても買わないと使えず、買えばプランがなくても使える", () => {
    expect(
      toUserAvatarFrameAccess(coin, {
        currentPassType: "PREMIUM",
        ownedFrameIds: [],
      }),
    ).toBe("NEEDS_COINS")
    expect(
      toUserAvatarFrameAccess(coin, {
        currentPassType: null,
        ownedFrameIds: ["2"],
      }),
    ).toBe("AVAILABLE")
  })

  test("種類と分類で絞る", () => {
    const base = {
      currentPassType: null,
      ownedFrameIds: ["2"],
      category: "all" as const,
    }
    const frames = [plan, coin]
    expect(
      filterUserAvatarFrames(frames, { ...base, kind: "SUBSCRIPTION" }),
    ).toEqual([plan])
    expect(filterUserAvatarFrames(frames, { ...base, kind: "COIN" })).toEqual([
      coin,
    ])
    expect(filterUserAvatarFrames(frames, { ...base, kind: "OWNED" })).toEqual([
      coin,
    ])
    expect(
      filterUserAvatarFrames(frames, { ...base, kind: "ALL", category: "wa" }),
    ).toEqual([coin])
  })
})

describe("装飾の小さい版", () => {
  test("public の装飾は 128px・256px 版と元の 384px を srcset にする", () => {
    expect(
      toUserAvatarDecorationSrcSet("/avatar-frames/deco/angel.webp?v=1"),
    ).toBe(
      "/avatar-frames/deco/angel.w128.webp?v=1 128w, /avatar-frames/deco/angel.w256.webp?v=1 256w, /avatar-frames/deco/angel.webp?v=1 384w",
    )
  })

  test("それ以外の URL は元の画像のまま", () => {
    expect(
      toUserAvatarDecorationSrcSet("https://files.aipictors.com/frame.webp"),
    ).toBeUndefined()
    expect(
      toUserAvatarDecorationSrcSet("/avatar-frames/deco/angel.anim.webp"),
    ).toBeUndefined()
  })
})
