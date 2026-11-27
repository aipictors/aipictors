import { describe, expect, test } from "bun:test"
import {
  canSupportWithPremium,
  isPremiumSupportUserOnlyError,
} from "~/utils/premium-support-user-only"

describe("canSupportWithPremium", () => {
  test("作品からの推しは、オリジナル作品でも二次創作でもプレミアム不可", () => {
    expect(canSupportWithPremium({ workId: "1" })).toBe(false)
  })

  test("作品を通さないユーザーへの推し（プロフィール）はプレミアム可", () => {
    expect(canSupportWithPremium({})).toBe(true)
    expect(canSupportWithPremium({ workId: null })).toBe(true)
    expect(canSupportWithPremium({ workId: "" })).toBe(true)
  })
})

describe("isPremiumSupportUserOnlyError", () => {
  test("新しいコードと前のコードの両方で判定する", () => {
    expect(
      isPremiumSupportUserOnlyError({ code: "PREMIUM_SUPPORT_USER_ONLY" }),
    ).toBe(true)
    expect(
      isPremiumSupportUserOnlyError({ code: "PREMIUM_SUPPORT_ORIGINAL_ONLY" }),
    ).toBe(true)
    expect(
      isPremiumSupportUserOnlyError({
        message: "Forbidden: PREMIUM_SUPPORT_USER_ONLY",
      }),
    ).toBe(true)
  })

  test("API の文（GraphQL を通ってコードが落ちたとき）で判定する", () => {
    expect(
      isPremiumSupportUserOnlyError({
        message:
          "プレミアムコインでの推しは、作品ではなくユーザー（プロフィール）への推しだけに使えます（オリジナル作品も同じです）",
      }),
    ).toBe(true)
    expect(
      isPremiumSupportUserOnlyError({
        message: "プレミアムコインでの推しは、オリジナル作品だけに使えます",
      }),
    ).toBe(true)
  })

  test("ほかのエラーは対象外", () => {
    expect(
      isPremiumSupportUserOnlyError({
        message: "この作者はプレミアムコインでの応援を受け付けていません",
      }),
    ).toBe(false)
    expect(isPremiumSupportUserOnlyError({ code: "INSUFFICIENT" })).toBe(false)
    expect(isPremiumSupportUserOnlyError({ message: null })).toBe(false)
  })
})
