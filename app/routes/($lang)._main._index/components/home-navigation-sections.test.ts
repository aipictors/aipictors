import { describe, expect, test } from "bun:test"
import { getHomeNavigationSections } from "~/routes/($lang)._main._index/components/home-navigation-sections"

const findPlus = (
  plusStatus: "unknown" | "guest" | "free" | "member",
  liteOffer?: "unknown" | "trial" | "half" | "none",
) =>
  getHomeNavigationSections({ isSensitive: false, isModerator: false, plusStatus, liteOffer })
    .flatMap((section) => section.items.map((item) => ({ ...item, section: section.key })))
    .filter((item) => item.href === "/plus")

describe("getHomeNavigationSections の Aipictors+", () => {
  test("未ログイン・プランなしの人には上のほうに出す。印はお試しの対象なら 7 日間無料、対象外なら初月半額、確認中は出さない", () => {
    for (const status of ["guest", "free"] as const) {
      const [item, ...rest] = findPlus(status, "trial")
      expect(rest).toHaveLength(0)
      expect(item.section).toBe("main")
      expect(item.label[0]).toBe("Aipictors+")
      // 未ログインの人には、はじめての人向けだと分かるように書く
      expect(item.badge?.[0]).toBe(status === "guest" ? "初回7日間無料" : "7日間無料")
      expect(item.growthEvent).toBe("plus_nav_click")
    }
    expect(findPlus("free", "half")[0].badge?.[0]).toBe("初月半額")
    expect(findPlus("free", "unknown")[0].badge).toBeUndefined()
  })

  test("加入中の人には案内を出さず、「その他」に管理の入口だけ置く", () => {
    const [item, ...rest] = findPlus("member")
    expect(rest).toHaveLength(0)
    expect(item.section).toBe("more")
    expect(item.label[0]).toBe("プランの管理")
    expect(item.badge).toBeUndefined()
    expect(item.growthEvent).toBeUndefined()
  })

  test("確認中は出さない（加入中の人に一瞬だけ案内が出ないように）", () => {
    expect(findPlus("unknown")).toHaveLength(0)
  })
})
