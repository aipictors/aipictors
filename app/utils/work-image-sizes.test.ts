import { toWorkImageSizes } from "./work-image-sizes"

test("パソコンでは左のメニューを除いた幅と、高さから決まる幅の小さい方にする", () => {
  expect(toWorkImageSizes(1.5)).toBe(
    "(min-width: 768px) min(100vw - 424px, 72vh * 1.5), min(100vw, 64vh * 1.5)",
  )
})

test("縦横比が分からなければ幅いっぱいとみなす", () => {
  expect(toWorkImageSizes(undefined)).toBe(
    "(min-width: 768px) calc(100vw - 424px), 100vw",
  )
  expect(toWorkImageSizes(0)).toBe(
    "(min-width: 768px) calc(100vw - 424px), 100vw",
  )
})

test("括弧は 1 段まで（Cloudflare の Early Hints が 2 段の括弧の中のカンマで切るため）", () => {
  for (const sizes of [toWorkImageSizes(1.5), toWorkImageSizes(undefined)]) {
    let depth = 0
    let maxDepth = 0
    for (const char of sizes) {
      if (char === "(") depth++
      if (char === ")") depth--
      maxDepth = Math.max(maxDepth, depth)
    }
    expect(maxDepth).toBe(1)
  }
})
