import { expect, test } from "bun:test"
import { parsePageJump } from "~/utils/parse-page-jump"

test("入力したページ番号（1 始まり）を 0 始まりにする", () => {
  expect(parsePageJump("1", 32)).toBe(0)
  expect(parsePageJump("8", 32)).toBe(7)
  expect(parsePageJump(" 12 ", 32)).toBe(11)
  expect(parsePageJump("１５", 32)).toBe(14)
})

test("範囲外は最初か最後のページに寄せる", () => {
  expect(parsePageJump("0", 32)).toBe(0)
  expect(parsePageJump("99", 32)).toBe(31)
})

test("数字でないときは移らない", () => {
  expect(parsePageJump("", 32)).toBeNull()
  expect(parsePageJump("abc", 32)).toBeNull()
  expect(parsePageJump("-3", 32)).toBeNull()
  expect(parsePageJump("2.5", 32)).toBeNull()
  expect(parsePageJump("3", 0)).toBeNull()
})
