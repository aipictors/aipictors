import { describe, expect, test } from "bun:test"
import { toSupportReceiveStatus } from "./support-receive-status"

const off = { isRejectAll: false, isRejectPremium: false, isRejectFree: false }

describe("toSupportReceiveStatus", () => {
  test("何も止めていなければ受け付け中", () => {
    expect(toSupportReceiveStatus(off).level).toBe("open")
  })

  test("推しを受け付けないなら、ほかの設定より優先して止めている扱い", () => {
    expect(
      toSupportReceiveStatus({
        isRejectAll: true,
        isRejectPremium: true,
        isRejectFree: true,
      }).level,
    ).toBe("closed")
  })

  test("プレミアム・フリーの片方だけ止めているときは一部だけ", () => {
    expect(
      toSupportReceiveStatus({ ...off, isRejectPremium: true }).ja,
    ).toContain("フリーコインでの推しだけ")
    expect(toSupportReceiveStatus({ ...off, isRejectFree: true }).ja).toContain(
      "フリーコインは受け取りません",
    )
    expect(
      toSupportReceiveStatus({
        ...off,
        isRejectPremium: true,
        isRejectFree: true,
      }).level,
    ).toBe("limited")
  })
})
