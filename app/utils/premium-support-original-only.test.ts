import { describe, expect, test } from "bun:test"
import {
  canSupportWithPremium,
  isPremiumSupportOriginalOnlyError,
} from "~/utils/premium-support-original-only"

describe("canSupportWithPremium", () => {
  test("オリジナル系のタグが付いた作品だけ", () => {
    expect(
      canSupportWithPremium({ workId: "1", tagNames: ["少女", "オリジナル"] }),
    ).toBe(true)
    expect(canSupportWithPremium({ workId: "1", tagNames: ["Original"] })).toBe(
      true,
    )
    expect(canSupportWithPremium({ workId: "1", tagNames: ["初音ミク"] })).toBe(
      false,
    )
    expect(canSupportWithPremium({ workId: "1", tagNames: null })).toBe(false)
  })

  test("作品を通さないユーザーへの推し（プロフィール）はどんな作品の人にもプレミアム可", () => {
    expect(canSupportWithPremium({ tagNames: null })).toBe(true)
    expect(canSupportWithPremium({ workId: null, tagNames: ["初音ミク"] })).toBe(
      true,
    )
  })
})

describe("isPremiumSupportOriginalOnlyError", () => {
  test("コードか API の文で判定する", () => {
    expect(
      isPremiumSupportOriginalOnlyError({
        code: "PREMIUM_SUPPORT_ORIGINAL_ONLY",
      }),
    ).toBe(true)
    expect(
      isPremiumSupportOriginalOnlyError({
        message:
          "プレミアムコインでの推しは、オリジナル作品（「オリジナル」などのタグが付いた作品）だけに使えます",
      }),
    ).toBe(true)
    expect(
      isPremiumSupportOriginalOnlyError({
        message: "この作者はプレミアムコインでの応援を受け付けていません",
      }),
    ).toBe(false)
    expect(isPremiumSupportOriginalOnlyError({ message: null })).toBe(false)
  })
})
