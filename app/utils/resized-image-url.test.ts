import {
  nextResizedImageUrl,
  RESIZED_IMAGE_FALLBACK_SCRIPT,
  toCoverImageSizes,
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "./resized-image-url"

const URL = "https://files.aipictors.com/abc-123"
const V = "https://variants.aipictors.com/v2"
const W = "https://files.aipictors.com/_w"

test("files.aipictors.com の画像は R2 の縮小版の URL にする", () => {
  expect(toResizedImageUrl(URL, 90)).toBe(`${V}/96/abc-123`)
  expect(toResizedImageUrl(URL, 5000)).toBe(`${V}/1280/abc-123`)
})

test("ほかの画像・縮小済み・クエリ付きはそのまま", () => {
  expect(toResizedImageUrl("https://assets.aipictors.com/a.webp", 96)).toBe(
    "https://assets.aipictors.com/a.webp",
  )
  expect(toResizedImageUrl(`${URL}?x=1`, 96)).toBe(`${URL}?x=1`)
  expect(toResizedImageUrl(`${W}/240/abc-123`, 96)).toBe(`${W}/240/abc-123`)
  expect(toResizedImageSrcSet("https://example.com/a.png")).toBeUndefined()
  expect(toResizedImageUrl(null, 96)).toBeUndefined()
})

test("srcset は元画像の幅までにする", () => {
  expect(toResizedImageSrcSet(URL, { minWidth: 160, maxWidth: 300 })).toBe(
    [`${V}/240/abc-123 240w`, `${V}/480/abc-123 300w`].join(", "),
  )
})

test("large は元画像の幅が分かれば 1920・2560px の縮小版も候補にする", () => {
  expect(
    toResizedImageSrcSet(URL, { minWidth: 800, maxWidth: 2432, large: true }),
  ).toBe(
    [
      `${V}/800/abc-123 800w`,
      `${V}/1280/abc-123 1280w`,
      `${V}/1920/abc-123 1920w`,
      `${V}/2560/abc-123 2432w`,
    ].join(", "),
  )
  // 元画像より大きい幅は作らない
  expect(
    toResizedImageSrcSet(URL, { minWidth: 800, maxWidth: 1216, large: true }),
  ).toBe([`${V}/800/abc-123 800w`, `${V}/1280/abc-123 1216w`].join(", "))
  // 一番大きい幅より大きい元画像は 2560px までにする
  expect(
    toResizedImageSrcSet(URL, { minWidth: 1280, maxWidth: 4000, large: true }),
  ).toBe(
    [
      `${V}/1280/abc-123 1280w`,
      `${V}/1920/abc-123 1920w`,
      `${V}/2560/abc-123 2560w`,
    ].join(", "),
  )
  // 元の幅が分からなければ今までどおり 1280px まで
  expect(toResizedImageSrcSet(URL, { minWidth: 800, large: true })).toBe(
    [`${V}/800/abc-123 800w`, `${V}/1280/abc-123 1280w`].join(", "),
  )
})

test("読めなかったら R2 → 縮小の Worker → 元の画像の順に試す", () => {
  expect(nextResizedImageUrl(`${V}/240/abc-123`)).toBe(`${W}/240/abc-123`)
  expect(nextResizedImageUrl(`${W}/240/abc-123`)).toBe(URL)
  expect(nextResizedImageUrl(URL)).toBeNull()
  expect(nextResizedImageUrl("https://assets.aipictors.com/a.webp")).toBeNull()
})

type FakeElement = {
  tagName: string
  attributes: Map<string, string>
  parentNode: FakeElement | null
  children: FakeElement[]
  currentSrc?: string
  src?: string
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
}

const element = (
  tagName: string,
  attributes: Record<string, string>,
): FakeElement => ({
  tagName,
  attributes: new Map(Object.entries(attributes)),
  parentNode: null,
  children: [],
  getAttribute(name) {
    return this.attributes.get(name) ?? null
  },
  setAttribute(name, value) {
    this.attributes.set(name, value)
  },
  removeAttribute(name) {
    this.attributes.delete(name)
  },
})

/** head のスクリプトを動かし、error イベントを 1 回送る。止めたかどうかを返す */
const fireError = (target: FakeElement) => {
  let listener: ((event: unknown) => void) | undefined
  new Function("addEventListener", RESIZED_IMAGE_FALLBACK_SCRIPT)(
    (type: string, fn: (event: unknown) => void, capture: boolean) => {
      expect(type).toBe("error")
      expect(capture).toBe(true)
      listener = fn
    },
  )
  let stopped = false
  listener?.({
    target,
    stopImmediatePropagation: () => {
      stopped = true
    },
  })
  return stopped
}

test("R2 に無い縮小版は srcset ごと縮小の Worker に切り替える", () => {
  const srcset = toResizedImageSrcSet(URL, { minWidth: 400 }) ?? ""
  const img = element("IMG", { src: URL, srcset })
  img.currentSrc = `${V}/800/abc-123`
  expect(fireError(img)).toBe(true)
  expect(img.getAttribute("srcset")).toBe(srcset.replaceAll(`${V}/`, `${W}/`))
  // 元画像の src はそのまま（srcset が優先される）
  expect(img.getAttribute("src")).toBe(URL)
})

test("src だけの縮小版も切り替え、<picture> の空画像の source は触らない", () => {
  const picture = element("PICTURE", {})
  const blank = element("SOURCE", { srcset: "data:image/gif;base64,R0lGOD" })
  const img = element("IMG", { src: `${V}/240/abc-123` })
  img.currentSrc = `${V}/240/abc-123`
  picture.children = [blank, img]
  img.parentNode = picture
  expect(fireError(img)).toBe(true)
  expect(img.getAttribute("src")).toBe(`${W}/240/abc-123`)
  expect(blank.getAttribute("srcset")).toBe("data:image/gif;base64,R0lGOD")
})

test("縮小の Worker でも読めなければ元の画像にし、その次は何もしない", () => {
  const img = element("IMG", {
    src: `${W}/240/abc-123`,
    srcset: `${W}/240/abc-123 240w`,
  })
  img.currentSrc = `${W}/240/abc-123`
  expect(fireError(img)).toBe(true)
  expect(img.getAttribute("srcset")).toBeNull()
  expect(img.getAttribute("src")).toBe(URL)

  img.currentSrc = URL
  expect(fireError(img)).toBe(false)
  expect(fireError(element("LINK", {}))).toBe(false)
})

test("切り抜く枠より横長の絵は、描かれる幅の分だけ sizes を広げる", () => {
  const entries = [
    { media: "(min-width: 768px)", width: "300px", aspectRatio: 1 },
    { width: "50vw", aspectRatio: 0.8 },
  ]
  // 16:9 の絵を正方形と 4:5 の枠に置く
  expect(toCoverImageSizes(entries, 16 / 9)).toBe(
    "(min-width: 768px) calc(300px * 1.78), calc(50vw * 2.22)",
  )
  // 縦長の絵は幅で合うのでそのまま
  expect(toCoverImageSizes(entries, 2 / 3)).toBe(
    "(min-width: 768px) 300px, 50vw",
  )
  // 比が分からないときもそのまま
  expect(toCoverImageSizes(entries, null)).toBe(
    "(min-width: 768px) 300px, 50vw",
  )
})
