import { expect, test } from "bun:test"
import {
  isDefaultStickerId,
  moveDefaultStickersToEnd,
} from "~/utils/default-stickers"

test("新旧の既定のスタンプを見分ける", () => {
  expect(isDefaultStickerId("88355")).toBe(true)
  expect(isDefaultStickerId("0")).toBe(true)
  expect(isDefaultStickerId("87650")).toBe(false)
})

test("保存したスタンプを先に、既定のスタンプを後ろに並べる（それぞれの順番はそのまま）", () => {
  const stickers = ["88355", "88356", "87651", "87650", "0", "87433"].map(
    (id) => ({ id }),
  )

  expect(moveDefaultStickersToEnd(stickers).map((s) => s.id)).toEqual([
    "87651",
    "87650",
    "87433",
    "88355",
    "88356",
    "0",
  ])
})

test("保存したスタンプが無ければ既定のスタンプだけをそのまま返す", () => {
  const stickers = [{ id: "88355" }, { id: "88356" }]

  expect(moveDefaultStickersToEnd(stickers)).toEqual(stickers)
})
