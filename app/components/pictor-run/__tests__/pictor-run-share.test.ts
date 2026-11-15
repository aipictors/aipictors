import { describe, expect, test } from "bun:test"
import {
  parsePictorRunShareKey,
  toPictorRunShareKey,
} from "~/components/pictor-run/pictor-run-share"

describe("pictor-run-share", () => {
  test("20 万 m を超える得点もそのままシェアできる", () => {
    const key = toPictorRunShareKey({
      score: 223440,
      coins: 31000,
      stage: 12,
      userId: "149372",
    })
    expect(key).toBe("223440-31000-12-u149372")
    expect(parsePictorRunShareKey(key)).toEqual({
      score: 223440,
      coins: 31000,
      stage: 12,
      userId: "149372",
    })
  })
})
