import { expect, test } from "bun:test"
import {
  type AmazonExchangeAdminRequest,
  filterExchangeRequests,
  formatDelta,
  formatTargetScope,
  jstDateTimeFormatter,
  parseUserIdsText,
} from "./admin-coins-utils"

test("ユーザー ID は区切りをまたいで重複を除く", () => {
  expect(parseUserIdsText(" 1, 2、3 \n4,1 ")).toEqual(["1", "2", "3", "4"])
  expect(parseUserIdsText("  ")).toEqual([])
})

test("対象範囲の表示", () => {
  expect(formatTargetScope("ALL", null)).toBe("全ユーザ")
  expect(formatTargetScope("USER_IDS", "LITE")).toBe("ユーザID指定")
  expect(formatTargetScope("PLAN", "TWO_DAYS")).toBe("2日プラン")
  expect(formatTargetScope("PLAN", "X")).toBe("プラン別")
  expect(formatTargetScope("PLAN", null)).toBe("プラン別")
})

test("増減の表示", () => {
  expect(formatDelta(5, 0)).toBe("フリー +5")
  expect(formatDelta(0, -2)).toBe("プレミアム -2")
  expect(formatDelta(1, -2)).toBe("フリー +1 / プレミアム -2")
  expect(formatDelta(0, 0)).toBe("0")
})

test("日時は日本時間で出す", () => {
  expect(jstDateTimeFormatter.format(new Date("2026-01-01T15:30:00Z"))).toBe(
    "2026/01/02 00:30",
  )
})

const request = (
  id: string,
  status: AmazonExchangeAdminRequest["status"],
  amazonGiftCode: string | null,
): AmazonExchangeAdminRequest => ({
  id,
  userId: "1",
  packageId: "p",
  coinAmount: 1,
  amazonPointYen: 1,
  status,
  amazonGiftCode,
  appliedAt: 1,
  approvedAt: null,
})

test("交換申請を状態で絞る（コード反映は空白だけのコードを含めない）", () => {
  const requests = [
    request("pending", "PENDING", null),
    request("approved", "APPROVED", null),
    request("blank", "APPROVED", "  "),
    request("reflected", "APPROVED", "CODE"),
  ]
  const ids = (filter: "PENDING" | "APPROVED" | "REFLECTED") =>
    filterExchangeRequests(requests, filter).map((item) => item.id)

  expect(ids("PENDING")).toEqual(["pending"])
  expect(ids("APPROVED")).toEqual(["approved", "blank", "reflected"])
  expect(ids("REFLECTED")).toEqual(["reflected"])
})
