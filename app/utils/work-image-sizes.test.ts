import { toWorkImageSizes } from "./work-image-sizes"

test("パソコンでは左のメニューを除いた幅と、高さから決まる幅の小さい方にする", () => {
  expect(toWorkImageSizes(1.5)).toBe(
    "(min-width: 768px) min(calc(100vw - 424px), calc(72vh * 1.5)), min(100vw, calc(64vh * 1.5))",
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
