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


test("データを外したページは hydration の前にデータを読み込む", () => {
  const script = toDeferredModuleScript("x", {
    waitForInteraction: true,
    contextToken: "abc",
  })
  expect(script).toContain('fetch("/__ctx/abc")')
  expect(script.indexOf("/__ctx/abc")).toBeLessThan(script.indexOf("await import("))
})
