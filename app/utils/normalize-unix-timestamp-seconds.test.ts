import { expect, test } from "bun:test"
import { normalizeUnixTimestampSeconds } from "~/utils/normalize-unix-timestamp-seconds"

test("秒はそのまま、ミリ秒は秒に", () => {
  expect(normalizeUnixTimestampSeconds(1_700_000_000)).toBe(1_700_000_000)
  expect(normalizeUnixTimestampSeconds(1_700_000_000_000)).toBe(1_700_000_000)
})

test("数字の文字列も読む。空や数値以外は null", () => {
  expect(normalizeUnixTimestampSeconds("1700000000")).toBe(1_700_000_000)
  expect(normalizeUnixTimestampSeconds("  ")).toBeNull()
  expect(normalizeUnixTimestampSeconds(null)).toBeNull()
  expect(normalizeUnixTimestampSeconds({})).toBeNull()
})
