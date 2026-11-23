import { afterEach, describe, expect, setSystemTime, test } from "bun:test"
import { getTimeRangeDates } from "~/routes/($lang)._main._index/utils/works-utils"

// 端末の時刻（ローカル）で数えるので、期待値もローカルの日付で作る
const local = (month: number, day: number, hour = 0) =>
  new Date(2026, month - 1, day, hour)

describe("新着一覧の期間（全年齢・R18 共通）", () => {
  afterEach(() => {
    setSystemTime()
  })

  test("先週は先週の月曜 0:00〜今週の月曜 0:00（過去 7 日ではない）", () => {
    // 2026-11-25 は水曜
    setSystemTime(local(11, 25, 15))
    expect(getTimeRangeDates("WEEK")).toEqual({
      createdAtAfter: local(11, 16).toISOString(),
      createdAtBefore: local(11, 23).toISOString(),
    })
  })

  test("月曜も日曜も同じ数え方", () => {
    // 2026-11-23 は月曜 → 先週は 11/16〜11/22
    setSystemTime(local(11, 23, 9))
    expect(getTimeRangeDates("WEEK")).toEqual({
      createdAtAfter: local(11, 16).toISOString(),
      createdAtBefore: local(11, 23).toISOString(),
    })
    // 2026-11-29 は日曜 → まだ今週なので先週は 11/16〜11/22
    setSystemTime(local(11, 29, 23))
    expect(getTimeRangeDates("WEEK")).toEqual({
      createdAtAfter: local(11, 16).toISOString(),
      createdAtBefore: local(11, 23).toISOString(),
    })
  })

  test("今日・昨日は 0:00 で区切る", () => {
    setSystemTime(local(11, 25, 15))
    expect(getTimeRangeDates("TODAY").createdAtAfter).toBe(
      local(11, 25).toISOString(),
    )
    expect(getTimeRangeDates("YESTERDAY")).toEqual({
      createdAtAfter: local(11, 24).toISOString(),
      createdAtBefore: local(11, 25).toISOString(),
    })
  })
})
