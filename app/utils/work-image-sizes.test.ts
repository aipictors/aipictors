import { pickWorkImageSizeHint, toWorkImageSizes } from "./work-image-sizes"

test("パソコンでは左のメニューを除いた幅と、高さから決まる幅の小さい方にする", () => {
  expect(toWorkImageSizes(1.5)).toBe(
    "(min-width: 1600px) min(80vw, 108vh), (min-width: 768px) min(70vw, 108vh), min(100vw, 96vh)",
  )
})

test("縦横比が分からなければ幅いっぱいとみなす", () => {
  expect(toWorkImageSizes(undefined)).toBe(
    "(min-width: 1600px) 80vw, (min-width: 768px) 70vw, 100vw",
  )
  expect(toWorkImageSizes(0)).toBe(
    "(min-width: 1600px) 80vw, (min-width: 768px) 70vw, 100vw",
  )
})

test("計算と小数を入れない（Cloudflare の Early Hints が計算の入った imagesizes を切るため）", () => {
  for (const sizes of [
    toWorkImageSizes(1.462),
    toWorkImageSizes(0.6875),
    toWorkImageSizes(undefined),
  ]) {
    expect(sizes).not.toMatch(/calc|[*+]|\d\.\d|\s-\s/)
  }
})

test("メイン画像の大きさの手がかりは 1 枚目にだけ使う", () => {
  const hint = { width: 864, aspectRatio: 0.5625 }
  const urls = ["https://example.com/a", "https://example.com/b"]
  expect(pickWorkImageSizeHint(urls[0], urls, hint)).toBe(hint)
  expect(pickWorkImageSizeHint(urls[1], urls, hint)).toBeUndefined()
  expect(pickWorkImageSizeHint(urls[1], urls, undefined)).toBeUndefined()
})
