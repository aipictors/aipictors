import { describe, expect, test } from "bun:test"
import {
  buildReferralUrl,
  parseStoredReferral,
  REFERRAL_MAX_ATTEMPTS,
  REFERRAL_TTL_MS,
  stripReferralParam,
  toReferralCode,
} from "~/lib/referral/referral-storage"

describe("toReferralCode", () => {
  test("英小文字と数字のコードだけ受け付け、大文字と前後の空白はそろえる", () => {
    expect(toReferralCode("k7m2x9qa")).toBe("k7m2x9qa")
    expect(toReferralCode(" K7M2X9QA ")).toBe("k7m2x9qa")
    expect(toReferralCode("abc")).toBeNull()
    expect(toReferralCode("../../etc")).toBeNull()
    expect(toReferralCode("<script>")).toBeNull()
    expect(toReferralCode(null)).toBeNull()
  })
})

describe("stripReferralParam", () => {
  test("ref だけを外し、ほかのクエリとハッシュは残す", () => {
    expect(stripReferralParam("https://www.aipictors.com/?ref=k7m2x9qa")).toBe("/")
    expect(
      stripReferralParam("https://www.aipictors.com/en/invite?ref=k7m2x9qa&utm_source=x#top"),
    ).toBe("/en/invite?utm_source=x#top")
  })

  test("ref がなければ null（URL を書き換えない）", () => {
    expect(stripReferralParam("https://www.aipictors.com/posts/1?page=2")).toBeNull()
  })
})

describe("parseStoredReferral", () => {
  const now = 1_800_000_000_000

  test("期限内のものを返す", () => {
    const raw = JSON.stringify({ code: "k7m2x9qa", at: now - 1000, attempts: 1 })
    expect(parseStoredReferral(raw, now)).toEqual({ code: "k7m2x9qa", at: now - 1000, attempts: 1 })
  })

  test("30 日を過ぎたもの・試しすぎたもの・形が違うものは null", () => {
    expect(
      parseStoredReferral(JSON.stringify({ code: "k7m2x9qa", at: now - REFERRAL_TTL_MS - 1 }), now),
    ).toBeNull()
    expect(
      parseStoredReferral(
        JSON.stringify({ code: "k7m2x9qa", at: now, attempts: REFERRAL_MAX_ATTEMPTS }),
        now,
      ),
    ).toBeNull()
    expect(parseStoredReferral(JSON.stringify({ code: "x", at: now }), now)).toBeNull()
    expect(parseStoredReferral("not json", now)).toBeNull()
    expect(parseStoredReferral(null, now)).toBeNull()
  })
})

describe("buildReferralUrl", () => {
  test("紹介ページに着くリンク（英語は /en）", () => {
    expect(buildReferralUrl("https://www.aipictors.com", "k7m2x9qa", "ja")).toBe(
      "https://www.aipictors.com/invite?ref=k7m2x9qa",
    )
    expect(buildReferralUrl("https://www.aipictors.com", "k7m2x9qa", "en")).toBe(
      "https://www.aipictors.com/en/invite?ref=k7m2x9qa",
    )
  })
})
