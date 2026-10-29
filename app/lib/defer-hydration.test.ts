import { shouldWaitForInteraction, toDeferredModuleScript } from "./defer-hydration"

test("閲覧ページだけ操作まで hydration を待つ", () => {
  for (const path of ["/", "/en", "/home", "/en/home", "/r/home", "/posts/818842", "/tags/%E7%8C%AB", "/rankings", "/users/admin", "/search", "/themes", "/themes/2026/10/28", "/r/tags/a"]) {
    expect(shouldWaitForInteraction(path)).toBe(true)
  }
  for (const path of ["/generation", "/settings/account", "/new/image", "/posts/1/edit", "/admin/works", "/my", "/events/x"]) {
    expect(shouldWaitForInteraction(path)).toBe(false)
  }
})

test("待つときだけ操作待ちの処理が入る", () => {
  expect(toDeferredModuleScript("x", { waitForInteraction: true })).toContain("pointerdown")
  expect(toDeferredModuleScript("x")).not.toContain("pointerdown")
})
