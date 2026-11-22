import { describe, expect, test } from "bun:test"
import {
  daysSinceLiteDayTrial,
  isLiteDayTrialActive,
  shouldShowLiteDayFollowup,
} from "~/routes/($lang).generation._index/utils/lite-day-trial"

const at = (iso: string) => Date.parse(iso)
const endsAt = at("2026-11-23T00:00:00+09:00") / 1000

describe("ライト1日体験", () => {
  test("体験中はその日の 24 時まで有効、プランの人は対象外", () => {
    const trial = { status: "active", trialDate: "2026-11-22", endsAt }
    expect(
      isLiteDayTrialActive(trial, false, at("2026-11-22T23:59:00+09:00")),
    ).toBe(true)
    expect(
      isLiteDayTrialActive(trial, false, at("2026-11-23T00:00:01+09:00")),
    ).toBe(false)
    expect(
      isLiteDayTrialActive(trial, true, at("2026-11-22T12:00:00+09:00")),
    ).toBe(false)
    expect(isLiteDayTrialActive(null, false)).toBe(false)
  })

  test("日数は日本時間の日付で数える", () => {
    const trial = { status: "used", trialDate: "2026-11-22", endsAt }
    // 11/23 08:30 JST は UTC ではまだ 11/22
    expect(daysSinceLiteDayTrial(trial, at("2026-11-23T08:30:00+09:00"))).toBe(
      1,
    )
    expect(daysSinceLiteDayTrial(trial, at("2026-11-22T23:00:00+09:00"))).toBe(
      0,
    )
  })

  test("翌日〜7 日後のプランに入っていない人にだけ案内する", () => {
    const trial = { status: "used", trialDate: "2026-11-22", endsAt }
    expect(
      shouldShowLiteDayFollowup(trial, false, at("2026-11-23T10:00:00+09:00")),
    ).toBe(true)
    expect(
      shouldShowLiteDayFollowup(trial, false, at("2026-11-29T10:00:00+09:00")),
    ).toBe(true)
    expect(
      shouldShowLiteDayFollowup(trial, false, at("2026-11-30T10:00:00+09:00")),
    ).toBe(false)
    expect(
      shouldShowLiteDayFollowup(trial, true, at("2026-11-23T10:00:00+09:00")),
    ).toBe(false)
    expect(
      shouldShowLiteDayFollowup(
        { ...trial, status: "active" },
        false,
        at("2026-11-22T10:00:00+09:00"),
      ),
    ).toBe(false)
  })
})
