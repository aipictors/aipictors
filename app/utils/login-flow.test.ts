import { describe, expect, test } from "bun:test"
import {
  isInAppBrowser,
  toSafeNextPath,
  toSocialLoginErrorMessage,
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
