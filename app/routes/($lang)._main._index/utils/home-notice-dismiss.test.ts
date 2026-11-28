import { describe, expect, test } from "bun:test"
import {
  buildHomeNoticeInlineScript,
  dismissNoticeCard,
  getHiddenNoticeCards,
  HOME_NOTICE_HIDDEN_ATTRIBUTE,
  HOME_NOTICE_STORAGE_KEY,
  isPinnedRelease,
  parseDismissedRecord,
  toEventNoticeKeys,
  toReleaseNoticeKeys,
} from "./home-notice-dismiss"

const HOUR = 60 * 60 * 1000
const now = Date.parse("2026-11-28T12:00:00Z")

const release = (
  id: string,
  props: Partial<{
    tag: string
    is_important: boolean
    publishedAt: string
  }> = {},
) => ({
  id,
  createdAt: now - 10 * 24 * HOUR,
  publishedAt: props.publishedAt ?? new Date(now - 5 * 24 * HOUR).toISOString(),
  tag: props.tag,
  is_important: props.is_important ?? false,
})

const event = (id: string, startAt = 1_800_000_000) => ({
  id,
  startAt,
  endAt: startAt + 86400,
})

describe("閉じた記録", () => {
  test("閉じた枠は、中身が同じなら次も出ない", () => {
    const keys = {
      events: toEventNoticeKeys([event("1"), event("2")]),
      releases: toReleaseNoticeKeys([release("a")]),
    }
    const record = dismissNoticeCard({}, "events", keys.events)
    expect(getHiddenNoticeCards(keys, record)).toEqual(["events"])
    // 保存した文字列から読み直しても同じ
    expect(
      getHiddenNoticeCards(keys, parseDismissedRecord(JSON.stringify(record))),
    ).toEqual(["events"])
  })

  test("新しいお知らせが来たらまた出る", () => {
    const before = { releases: toReleaseNoticeKeys([release("a")]) }
    const record = dismissNoticeCard({}, "releases", before.releases)
    const after = {
      releases: toReleaseNoticeKeys([release("b"), release("a")]),
    }
    expect(getHiddenNoticeCards(after, record)).toEqual([])
  })

  test("同じお知らせでも出し直し（公開日が変わる）たらまた出る", () => {
    const record = dismissNoticeCard(
      {},
      "releases",
      toReleaseNoticeKeys([release("a")]),
    )
    const republished = {
      releases: toReleaseNoticeKeys([
        release("a", { publishedAt: new Date(now - HOUR).toISOString() }),
      ]),
    }
    expect(getHiddenNoticeCards(republished, record)).toEqual([])
  })

  test("終わったイベントが抜けただけなら出ない", () => {
    const record = dismissNoticeCard(
      {},
      "events",
      toEventNoticeKeys([event("1"), event("2")]),
    )
    expect(
      getHiddenNoticeCards({ events: toEventNoticeKeys([event("2")]) }, record),
    ).toEqual(["events"])
  })

  test("イベントが無い枠も閉じられ、イベントが始まるとまた出る", () => {
    const record = dismissNoticeCard({}, "events", toEventNoticeKeys([]))
    expect(
      getHiddenNoticeCards({ events: toEventNoticeKeys([]) }, record),
    ).toEqual(["events"])
    expect(
      getHiddenNoticeCards({ events: toEventNoticeKeys([event("3")]) }, record),
    ).toEqual([])
  })

  test("壊れた記録は無視する", () => {
    expect(parseDismissedRecord("{")).toEqual({})
    expect(parseDismissedRecord("null")).toEqual({})
    expect(parseDismissedRecord(JSON.stringify({ events: [1, "x"] }))).toEqual({
      events: ["x"],
    })
  })
})

describe("閉じられない枠", () => {
  test("重要の印のお知らせは出してから 48 時間は閉じられず、過ぎたら閉じられる", () => {
    expect(
      isPinnedRelease(
        release("a", {
          is_important: true,
          publishedAt: new Date(now - 3 * HOUR).toISOString(),
        }),
        now,
      ),
    ).toBe(true)
    expect(isPinnedRelease(release("a", { is_important: true }), now)).toBe(
      false,
    )
  })

  test("メンテナンスは出してから 48 時間は閉じられず、過ぎたら閉じられる", () => {
    const fresh = release("m", {
      tag: "メンテナンス",
      publishedAt: new Date(now - 3 * HOUR).toISOString(),
    })
    const old = release("m", {
      tag: "メンテナンス",
      publishedAt: new Date(now - 49 * HOUR).toISOString(),
    })
    expect(isPinnedRelease(fresh, now)).toBe(true)
    expect(isPinnedRelease(old, now)).toBe(false)
  })

  test("ふつうのお知らせは閉じられる", () => {
    expect(isPinnedRelease(release("u", { tag: "アップデート" }), now)).toBe(
      false,
    )
  })

  test("閉じられない枠は鍵を持たないので、記録があっても隠れない", () => {
    const record = { releases: toReleaseNoticeKeys([release("a")]) }
    expect(getHiddenNoticeCards({ events: ["x"] }, record)).toEqual([])
  })
})

describe("最初の描画の前に動くスクリプト", () => {
  const run = (
    keys: Parameters<typeof buildHomeNoticeInlineScript>[0],
    stored: string | null,
  ) => {
    const attributes = new Map<string, string>()
    const localStorage = {
      getItem: (key: string) =>
        key === HOME_NOTICE_STORAGE_KEY ? stored : null,
    }
    const document = {
      documentElement: {
        setAttribute: (name: string, value: string) =>
          attributes.set(name, value),
      },
    }
    new Function("localStorage", "document", buildHomeNoticeInlineScript(keys))(
      localStorage,
      document,
    )
    return attributes.get(HOME_NOTICE_HIDDEN_ATTRIBUTE) ?? null
  }

  test("閉じた枠だけ <html> に付ける", () => {
    const keys = { events: ["e1"], releases: ["r1"] }
    expect(run(keys, JSON.stringify({ events: ["e1"] }))).toBe("events")
    expect(
      run(keys, JSON.stringify({ events: ["e1"], releases: ["r1"] })),
    ).toBe("events releases")
    expect(run(keys, JSON.stringify({ releases: ["r0"] }))).toBeNull()
    expect(run(keys, null)).toBeNull()
    expect(run(keys, "{")).toBeNull()
  })

  test("</script> を含む鍵でもスクリプトが途切れない", () => {
    expect(
      buildHomeNoticeInlineScript({ events: ["</script>"] }),
    ).not.toContain("</script>")
  })
})
