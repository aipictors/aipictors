import { describe, expect, test } from "bun:test"
import { getCookie } from "~/utils/get-cookie"

describe("getCookie", () => {
  test("指定したIDのCookieが取得できる", () => {
    // document.cookieをモック
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "userId=12345; token=abcde",
    })

    const result = getCookie("userId")
    expect(result).toBe("12345")
  })

  test("指定したIDのCookieが存在しない場合、nullを返す", () => {
    // document.cookieをモック
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "userId=12345; token=abcde",
    })

    const result = getCookie("nonExistentCookie")
    expect(result).toBeNull()
  })

  test("空のCookieの場合、nullを返す", () => {
    // document.cookieをモック
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    })

    const result = getCookie("userId")
    expect(result).toBeNull()
  })

  test("例外が発生した場合、nullを返す", () => {
    // document.cookieをモックし、不正な値をセット
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "invalid-cookie",
    })

    const result = getCookie("userId")
    expect(result).toBeNull()
  })
})
