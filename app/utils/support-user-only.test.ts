import { describe, expect, test } from "bun:test"
import { isSupportUserOnlyError } from "~/utils/support-user-only"

describe("isSupportUserOnlyError", () => {
  test("コード SUPPORT_USER_ONLY で判定する", () => {
    expect(isSupportUserOnlyError({ code: "SUPPORT_USER_ONLY" })).toBe(true)
    expect(
      isSupportUserOnlyError({ message: "Forbidden: SUPPORT_USER_ONLY" }),
    ).toBe(true)
  })

  test("GraphQL で文だけ届くときは文で判定する", () => {
    expect(
      isSupportUserOnlyError({
        message:
          "作品への推しは終了しました。推しはユーザー（プロフィール）への推しだけになりました",
      }),
    ).toBe(true)
  })

  test("ほかのエラーは対象外", () => {
    expect(isSupportUserOnlyError({ code: "Insufficient coins" })).toBe(false)
    expect(isSupportUserOnlyError({ message: "Insufficient coins" })).toBe(
      false,
    )
    expect(isSupportUserOnlyError({})).toBe(false)
  })
})
