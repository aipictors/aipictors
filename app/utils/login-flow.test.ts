import { describe, expect, test } from "bun:test"
import {
  clearLastLoginMethod,
  isInAppBrowser,
  readLastLoginMethod,
  toSafeNextPath,
  toSocialLoginErrorMessage,
  writeLastLoginMethod,
} from "~/utils/login-flow"

const t = (ja: string) => ja

describe("toSafeNextPath", () => {
  test("サイト内のパスだけを通す", () => {
    expect(toSafeNextPath("/posts/1?x=1")).toBe("/posts/1?x=1")
    expect(toSafeNextPath("https://example.com")).toBeNull()
    expect(toSafeNextPath("//example.com")).toBeNull()
    expect(toSafeNextPath("/\\example.com")).toBeNull()
    expect(toSafeNextPath(null)).toBeNull()
  })

  test("ログイン・登録の途中には戻さない", () => {
    expect(toSafeNextPath("/login")).toBeNull()
    expect(toSafeNextPath("/login?next=/a")).toBeNull()
    expect(toSafeNextPath("/en/login")).toBeNull()
    expect(toSafeNextPath("/new/profile")).toBeNull()
    expect(toSafeNextPath("/new/image")).toBe("/new/image")
    expect(toSafeNextPath("/login-help")).toBe("/login-help")
  })
})

describe("toSocialLoginErrorMessage", () => {
  test("自分で閉じたときは知らせない", () => {
    expect(
      toSocialLoginErrorMessage({ code: "auth/popup-closed-by-user" }, t),
    ).toBeNull()
  })

  test("原因ごとの文にする", () => {
    expect(
      toSocialLoginErrorMessage({ code: "auth/popup-blocked" }, t),
    ).toContain("ポップアップ")
    expect(
      toSocialLoginErrorMessage(
        { code: "auth/account-exists-with-different-credential" },
        t,
      ),
    ).toContain("別の方法")
    expect(toSocialLoginErrorMessage(new Error("x"), t)).toContain(
      "ログインできませんでした",
    )
  })
})

test("isInAppBrowser", () => {
  expect(isInAppBrowser("Mozilla/5.0 (iPhone) Line/13.0")).toBe(true)
  expect(isInAppBrowser("Mozilla/5.0 (Linux; Android 14; wv) Discord")).toBe(
    true,
  )
  expect(
    isInAppBrowser("Mozilla/5.0 (iPhone) AppleWebKit Version/18 Mobile Safari"),
  ).toBe(false)
})

describe("clearLastLoginMethod", () => {
  test("違う方法でログインしたあとは、前回の方法を覚えていない", () => {
    const store = new Map<string, string>()
    const original = globalThis.localStorage
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
        removeItem: (key: string) => store.delete(key),
      },
    })
    try {
      writeLastLoginMethod("google")
      expect(readLastLoginMethod()).toBe("google")
      clearLastLoginMethod()
      expect(readLastLoginMethod()).toBeNull()
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: original,
      })
    }
  })
})
