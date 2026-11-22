import { describe, expect, test } from "bun:test"
import { readdirSync } from "node:fs"
import { join } from "node:path"
import {
  filterUserAvatarFrames,
  hasPictorChan,
  isPlanExclusiveUserAvatarFrame,
  isSpecialUserAvatarFrame,
  isUserAvatarDecoration,
  toFrameImageUrl,
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

  test("public の装飾はすべて 128px・256px 版がある（ないとコメント欄などの小さいアイコンで枠がリンク切れになる）", () => {
    const folder = join(import.meta.dir, "../../../public/avatar-frames/deco")
    const names = new Set(readdirSync(folder))
    const missing = [...names]
      .filter((name) => /^[\w-]+\.webp$/.test(name))
      .flatMap((name) =>
        [128, 256]
          .map((w) => name.replace(/\.webp$/, `.w${w}.webp`))
          .filter((small) => !names.has(small)),
      )
    expect(missing).toEqual([])
  })
})

describe("ぴくたーちゃんを外すカスタム", () => {
  test("ぴくたーちゃんのいる枠だけを見分ける", () => {
    expect(
      hasPictorChan("/avatar-frames/deco/gacha-ssr-pictor-love.webp"),
    ).toBe(true)
    expect(
      hasPictorChan("/header-frames/gacha-ur-pictor-rainbow.pc.webp"),
    ).toBe(true)
    expect(hasPictorChan("/avatar-frames/deco/gacha-ur-kyubi.webp")).toBe(false)
  })

  test("外すと nopictor の画像になる（ヘッダーの動く絵はそのまま）", () => {
    const off = { showPictorChan: false }
    expect(
      toFrameImageUrl(
        "/avatar-frames/deco/gacha-sr-pictor-paint.webp?v=2",
        off,
      ),
    ).toBe("/avatar-frames/deco/gacha-sr-pictor-paint.nopictor.webp?v=2")
    expect(
      toFrameImageUrl(
        "/avatar-frames/deco/gacha-sr-pictor-paint.anim.webp",
        off,
      ),
    ).toBe("/avatar-frames/deco/gacha-sr-pictor-paint.nopictor.anim.webp")
    expect(
      toUserAvatarDecorationAnimatedUrl(
        toFrameImageUrl("/avatar-frames/deco/gacha-sr-pictor-paint.webp", off),
      ),
    ).toBe("/avatar-frames/deco/gacha-sr-pictor-paint.nopictor.anim.webp")
    expect(
      toFrameImageUrl("/header-frames/gacha-ssr-pictor-love.sp.webp", off),
    ).toBe("/header-frames/gacha-ssr-pictor-love.sp.nopictor.webp")
    expect(
      toFrameImageUrl(
        "/header-frames/gacha-ssr-pictor-love.sp.motion.webp",
        off,
      ),
    ).toBe("/header-frames/gacha-ssr-pictor-love.sp.motion.webp")
  })

  test("着けたまま・ぴくたーちゃんのいない枠は元の URL", () => {
    expect(
      toFrameImageUrl("/avatar-frames/deco/gacha-ssr-pictor-love.webp"),
    ).toBe("/avatar-frames/deco/gacha-ssr-pictor-love.webp")
    expect(
      toFrameImageUrl("/avatar-frames/deco/gacha-ur-kyubi.webp", {
        showPictorChan: false,
      }),
    ).toBe("/avatar-frames/deco/gacha-ur-kyubi.webp")
  })
})
