import { describe, expect, test } from "bun:test"
import { userNavigationStyles } from "~/routes/($lang)._main._index/components/user-navigation-styles"

describe("userNavigationStyles.menuContent", () => {
  test("メニューは画面に収まる高さまでにして、はみ出す分はスクロールできる", () => {
    expect(userNavigationStyles.menuContent).toContain(
      "max-h-[var(--radix-dropdown-menu-content-available-height)]",
    )
    expect(userNavigationStyles.menuContent).toContain("overflow-y-auto")
  })
})
