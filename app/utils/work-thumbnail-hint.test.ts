import { describe, expect, test } from "bun:test"
import {
  getWorkThumbnailHint,
  installWorkThumbnailHints,
} from "~/utils/work-thumbnail-hint"

const pressCard = (href: string, width: number, height: number) => {
  const link = document.createElement("a")
  link.setAttribute("href", href)
  const image = document.createElement("img")
  Object.defineProperty(image, "currentSrc", { value: "/_w/240/thumb" })
  Object.defineProperty(image, "naturalWidth", { value: width })
  Object.defineProperty(image, "naturalHeight", { value: height })
  link.appendChild(image)
  document.body.appendChild(link)
  image.dispatchEvent(new Event("pointerdown", { bubbles: true }))
}

describe("getWorkThumbnailHint", () => {
  test("押した作品のサムネイルを返す", () => {
    const uninstall = installWorkThumbnailHints()
    pressCard("/posts/123", 400, 600)
    expect(getWorkThumbnailHint("123", 2 / 3)).toBe("/_w/240/thumb")
    uninstall()
  })

  test("別の作品や、比率が違うサムネイルは使わない", () => {
    const uninstall = installWorkThumbnailHints()
    pressCard("/en/posts/124", 400, 400)
    expect(getWorkThumbnailHint("125", 1)).toBeUndefined()
    expect(getWorkThumbnailHint("124", 2 / 3)).toBeUndefined()
    expect(getWorkThumbnailHint("124", undefined)).toBeUndefined()
    uninstall()
  })
})
