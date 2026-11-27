import { expect, test } from "bun:test"
import {
  clearPremiumCheckoutSearchParams,
  excludeShownComments,
} from "../work-comment-list-utils"

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
