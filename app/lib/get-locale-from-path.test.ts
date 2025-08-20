import { test, expect } from "bun:test"
import { getLocaleFromPath } from "./get-locale-from-path"

test("パスが /en で始まる場合は en", () => {
  const result = getLocaleFromPath("/en/example")
  expect(result).toBe("en")
})

test("パスが / で ja", () => {
  const result = getLocaleFromPath("/")
  expect(result).toBe("ja")
})

test("パスが /abc で ja", () => {
  const result = getLocaleFromPath("/abc")
  expect(result).toBe("ja")
})

const cases: ReadonlyArray<Readonly<{ path: string; expected: "ja" | "en" }>> =
  [
    { path: "/", expected: "ja" },
    { path: "/en", expected: "en" },
    { path: "/en/", expected: "en" },
    { path: "/en/posts", expected: "en" },
    { path: "/ja", expected: "ja" },
    { path: "/posts", expected: "ja" },
  ]

for (const { path, expected } of cases) {
  test(`ロケール判定: ${path} -> ${expected}`, () => {
    const result = getLocaleFromPath(path)
    expect(result).toBe(expected)
  })
}
