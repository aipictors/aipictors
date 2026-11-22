import { describe, expect, test } from "bun:test"
import {
  isIosBrowserTab,
  shouldRefreshToken,
  toPushStatus,
} from "~/routes/($lang).settings.push-notification/utils/push-status"

const base = {
  isSupported: true,
  permission: "granted" as NotificationPermission,
  serverToken: "token-a",
  currentToken: "token-a",
}

describe("toPushStatus", () => {
  test("このブラウザのトークンがサーバーにあれば on", () => {
    expect(toPushStatus(base)).toBe("on")
  })

  test("サーバーのトークンが別なら other-browser", () => {
    expect(toPushStatus({ ...base, currentToken: "token-b" })).toBe(
      "other-browser",
    )
    expect(toPushStatus({ ...base, permission: "default" })).toBe(
      "other-browser",
    )
  })

  test("サーバーにトークンがなければ off", () => {
    expect(toPushStatus({ ...base, serverToken: null })).toBe("off")
    expect(
      toPushStatus({ ...base, serverToken: null, permission: "default" }),
    ).toBe("off")
  })

  test("ブロックと未対応を先に見る", () => {
    expect(toPushStatus({ ...base, permission: "denied" })).toBe("denied")
    expect(toPushStatus({ ...base, isSupported: false })).toBe("unsupported")
  })

  test("トークンを取っている間は checking", () => {
    expect(toPushStatus({ ...base, currentToken: undefined })).toBe("checking")
  })
})

describe("shouldRefreshToken", () => {
  test("前にこのブラウザで登録したトークンが入れ替わったときだけ登録し直す", () => {
    expect(
      shouldRefreshToken({
        serverToken: "old",
        currentToken: "new",
        localToken: "old",
      }),
    ).toBe(true)
    // 別のブラウザで登録したもの
    expect(
      shouldRefreshToken({
        serverToken: "other",
        currentToken: "new",
        localToken: "old",
      }),
    ).toBe(false)
    expect(
      shouldRefreshToken({
        serverToken: "same",
        currentToken: "same",
        localToken: "same",
      }),
    ).toBe(false)
    expect(
      shouldRefreshToken({
        serverToken: null,
        currentToken: "new",
        localToken: "old",
      }),
    ).toBe(false)
  })
})

describe("isIosBrowserTab", () => {
  test("iPhone のブラウザのタブだけ", () => {
    const iphone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
    expect(isIosBrowserTab(iphone, false)).toBe(true)
    expect(isIosBrowserTab(iphone, true)).toBe(false)
    expect(
      isIosBrowserTab("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", false),
    ).toBe(false)
  })
})
