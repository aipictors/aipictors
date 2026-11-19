import { expect, test } from "bun:test"
import {
  calculateCommentSupportDraft,
  clearPremiumCheckoutSearchParams,
  excludeShownComments,
  needsSupportConfirm,
  SUPPORT_FREE_COIN_STEPS,
  SUPPORT_PREMIUM_COIN_STEPS,
} from "../work-comment-list-utils"

test("フリーは 1pt、プレミアムは 10pt で数える", () => {
  expect(calculateCommentSupportDraft(10, 200, 100, 500)).toEqual({
    freeCoinAmount: 10,
    premiumCoinAmount: 200,
    totalPt: 2010,
  })
})

test("プレミアムは 1 枚から推せる", () => {
  expect(calculateCommentSupportDraft(0, 1, 0, 500)).not.toBeNull()
  expect(calculateCommentSupportDraft(0, 5, 0, 500)).not.toBeNull()
  expect(calculateCommentSupportDraft(0, 150, 0, 500)).not.toBeNull()
})

test("確認はフリー・プレミアムとも 1,000 枚から", () => {
  const draft = (free: number, premium: number) => ({
    freeCoinAmount: free,
    premiumCoinAmount: premium,
    totalPt: free + premium * 10,
  })
  expect(needsSupportConfirm(draft(0, 100))).toBe(false)
  expect(needsSupportConfirm(draft(0, 900))).toBe(false)
  expect(needsSupportConfirm(draft(0, 1000))).toBe(true)
  expect(needsSupportConfirm(draft(999, 0))).toBe(false)
  expect(needsSupportConfirm(draft(1000, 0))).toBe(true)
})

test("残高を超える、合計が 0、整数でない、負の値は null", () => {
  expect(calculateCommentSupportDraft(101, 0, 100, 5)).toBeNull()
  expect(calculateCommentSupportDraft(0, 600, 100, 500)).toBeNull()
  expect(calculateCommentSupportDraft(0, 0, 100, 5)).toBeNull()
  expect(calculateCommentSupportDraft(1.5, 0, 100, 5)).toBeNull()
  expect(calculateCommentSupportDraft(-1, 0, 100, 5)).toBeNull()
  expect(calculateCommentSupportDraft(0, -1, 100, 5)).toBeNull()
})

test("決済のパラメータだけを URL から消す", () => {
  const happy = window as unknown as { happyDOM: { setURL(url: string): void } }
  happy.happyDOM.setURL(
    "https://example.com/posts/1?checkout=premium-success&session_id=cs_1&x=1#c",
  )
  clearPremiumCheckoutSearchParams()
  expect(window.location.pathname + window.location.search).toBe("/posts/1?x=1")
})

test("一覧に届いた返信は仮表示から外す（作品を行き来しても二重にならない）", () => {
  const replies = [{ id: "1" }, { id: "2" }, { id: "3" }]
  expect(excludeShownComments(replies, ["1"], [])).toEqual([
    { id: "2" },
    { id: "3" },
  ])
})

test("非表示にしたものも外し、どちらでもないものは順番を保つ", () => {
  const replies = [{ id: "3" }, { id: "2" }, { id: "1" }]
  expect(excludeShownComments(replies, [], ["2"])).toEqual([
    { id: "3" },
    { id: "1" },
  ])
  expect(excludeShownComments(replies, [], [])).toEqual(replies)
})

test("コメント欄の推しコイン: フリーに 20、プレミアムは少額の 1・2 枚から", () => {
  expect(SUPPORT_FREE_COIN_STEPS).toContain(20)
  expect(SUPPORT_PREMIUM_COIN_STEPS).toEqual([1, 2, 3, 5, 10])
})
