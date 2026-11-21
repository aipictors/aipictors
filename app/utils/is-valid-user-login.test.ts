import { expect, test } from "bun:test"
import { isValidUserLogin } from "~/utils/is-valid-user-login"

test("英字を含む半角英数字・_・- は使える", () => {
  expect(isValidUserLogin("tencnobu")).toBe(true)
  expect(isValidUserLogin("a_1-2")).toBe(true)
})

test("英字がない・使えない文字・空は使えない", () => {
  expect(isValidUserLogin("12345")).toBe(false)
  expect(isValidUserLogin("ab c")).toBe(false)
  expect(isValidUserLogin("ab@c")).toBe(false)
  expect(isValidUserLogin("あいう")).toBe(false)
  expect(isValidUserLogin("")).toBe(false)
})
