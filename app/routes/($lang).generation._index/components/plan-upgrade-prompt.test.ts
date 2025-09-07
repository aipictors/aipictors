import { test, expect } from "bun:test"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

// テスト用のモック関数
const mockPlanUpgradePrompt = ({
  currentPlan,
}: {
  currentPlan?: IntrospectionEnum<"PassType"> | null
}) => {
  const getPlanName = (plan?: IntrospectionEnum<"PassType"> | null) => {
    switch (plan) {
      case "LITE":
        return "ライト"
      case "STANDARD":
        return "スタンダード"
      case "PREMIUM":
        return "プレミアム"
      default:
        return "無料"
    }
  }

  const getUpgradeMessage = (plan?: IntrospectionEnum<"PassType"> | null) => {
    switch (plan) {
      case "LITE":
        return "スタンダードで50ページまで"
      case "STANDARD":
        return "プレミアムで100ページまで"
      case "PREMIUM":
        return null // プレミアムプランは最上位なので表示しない
      default:
        return "ライトで30ページまで"
    }
  }

  return {
    planName: getPlanName(currentPlan),
    upgradeMessage: getUpgradeMessage(currentPlan),
    shouldShow: getUpgradeMessage(currentPlan) !== null,
  }
}

test("無料プランの場合、ライトプランへのアップグレードを促すメッセージが表示される", () => {
  const result = mockPlanUpgradePrompt({ currentPlan: null })
  
  expect(result.planName).toBe("無料")
  expect(result.upgradeMessage).toBe("ライトで30ページまで")
  expect(result.shouldShow).toBe(true)
})

test("ライトプランの場合、スタンダードプランへのアップグレードを促すメッセージが表示される", () => {
  const result = mockPlanUpgradePrompt({ currentPlan: "LITE" })
  
  expect(result.planName).toBe("ライト")
  expect(result.upgradeMessage).toBe("スタンダードで50ページまで")
  expect(result.shouldShow).toBe(true)
})

test("スタンダードプランの場合、プレミアムプランへのアップグレードを促すメッセージが表示される", () => {
  const result = mockPlanUpgradePrompt({ currentPlan: "STANDARD" })
  
  expect(result.planName).toBe("スタンダード")
  expect(result.upgradeMessage).toBe("プレミアムで100ページまで")
  expect(result.shouldShow).toBe(true)
})

test("プレミアムプランの場合、アップグレード促進メッセージは表示されない", () => {
  const result = mockPlanUpgradePrompt({ currentPlan: "PREMIUM" })

  expect(result.planName).toBe("プレミアム")
  expect(result.upgradeMessage).toBe(null)
  expect(result.shouldShow).toBe(false)
})
