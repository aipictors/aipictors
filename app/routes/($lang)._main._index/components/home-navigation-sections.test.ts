import { describe, expect, test } from "bun:test"
import { getHomeNavigationSections } from "~/routes/($lang)._main._index/components/home-navigation-sections"

const findPlus = (plusStatus: "unknown" | "guest" | "free" | "member") =>
  getHomeNavigationSections({ isSensitive: false, isModerator: false, plusStatus })
    .flatMap((section) => section.items.map((item) => ({ ...item, section: section.key })))
    .filter((item) => item.href === "/plus")

describe("getHomeNavigationSections の Aipictors+", () => {
  test("未ログイン・プランなしの人には、初月半額の印つきで上のほうに出す", () => {
    for (const status of ["guest", "free"] as const) {
      const [item, ...rest] = findPlus(status)
      expect(rest).toHaveLength(0)
      expect(item.section).toBe("main")
      expect(item.label[0]).toBe("Aipictors+")
      expect(item.badge?.[0]).toBe("初月半額")
      expect(item.growthEvent).toBe("plus_nav_click")
    }
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
