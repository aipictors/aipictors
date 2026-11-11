import { expect, test } from "bun:test"
import {
  calculateCommentSupportDraft,
  clearPremiumCheckoutSearchParams,
  excludeShownComments,
  SUPPORT_FREE_COIN_STEPS,
  SUPPORT_PREMIUM_COIN_STEPS,
} from "../work-comment-list-utils"

test("フリーは 1pt、プレミアムは 10pt で数える", () => {
  expect(calculateCommentSupportDraft(10, 2, 100, 5)).toEqual({
    freeCoinAmount: 10,
    premiumCoinAmount: 2,
    totalPt: 30,
  })
})

test("残高を超える、合計が 0、整数でない、負の値は null", () => {
  expect(calculateCommentSupportDraft(101, 0, 100, 5)).toBeNull()
  expect(calculateCommentSupportDraft(0, 6, 100, 5)).toBeNull()
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

test("コメント欄の推しコインにも 20（フリー）・2（プレミアム）がある（作品の推しコインと同じ枚数を選べる）", () => {
  expect(SUPPORT_FREE_COIN_STEPS).toContain(20)
  expect(SUPPORT_PREMIUM_COIN_STEPS).toContain(2)
})
