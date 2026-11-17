import { expect, test } from "bun:test"
import { isDefaultStickerId } from "~/utils/default-stickers"

test("新旧の既定のスタンプを見分ける", () => {
  expect(isDefaultStickerId("88355")).toBe(true)
  expect(isDefaultStickerId("0")).toBe(true)
  expect(isDefaultStickerId("87650")).toBe(false)
})
