import {
  getContextTokenAgeMs,
  shouldWaitForInteraction,
  toDeferredModuleScript,
} from "./defer-hydration"

test("閲覧ページだけ操作まで hydration を待つ", () => {
  for (const path of ["/posts", "/novels", "/notes", "/en/novels", "/stickers", "/stickers/88052", "/", "/en", "/home", "/en/home", "/r/home", "/posts/818842", "/tags/%E7%8C%AB", "/rankings", "/users/admin", "/search", "/themes", "/themes/2026/10/28", "/r/tags/a", "/new-works", "/ai-rankings", "/models/GeminiNanoBanana"]) {
    expect(shouldWaitForInteraction(path)).toBe(true)
  }
  for (const path of ["/stickers/search/猫", "/stickers/download", "/generation", "/settings/account", "/new/image", "/posts/1/edit", "/admin/works", "/my", "/events/x", "/models/upload", "/models/library", "/models/u/1"]) {
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
  expect(script).toContain('fetch("/__ctx/abc?p="')
  expect(script.indexOf("/__ctx/abc")).toBeLessThan(script.indexOf("await import("))
})

test("データのトークンから描画してからの時間が分かる", () => {
  const now = 1_800_000_000_000
  expect(getContextTokenAgeMs(`${(now - 1200).toString(36)}.0f2c-uuid`, now)).toBe(1200)
  // 以前の形（UUID だけ）は分からない
  expect(getContextTokenAgeMs("615e68ff-9262-458c-ad83-00ca0cc539cf", now)).toBe(null)
  expect(getContextTokenAgeMs(".abc", now)).toBe(null)
})
