import { expect, test } from "bun:test"
import { toHasSensitiveProfile } from "~/utils/has-sensitive-profile"

test("登録していなければ false", () => {
  expect(toHasSensitiveProfile(null)).toBe(false)
  expect(toHasSensitiveProfile(undefined)).toBe(false)
})

test("中身が空なら false", () => {
  expect(
    toHasSensitiveProfile({ headerImageUrl: null, biography: " ", links: [] }),
  ).toBe(false)
})

test("ヘッダー・紹介・リンクのどれかがあれば true", () => {
  expect(toHasSensitiveProfile({ headerImageUrl: "https://a/b.webp" })).toBe(
    true,
  )
  expect(toHasSensitiveProfile({ biography: "R18 用の紹介" })).toBe(true)
  expect(toHasSensitiveProfile({ links: ["https://fantia.jp/a"] })).toBe(true)
})
