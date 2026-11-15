import { act, render } from "@testing-library/react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const ICON = "https://files.aipictors.com/icon-1"

/** R2 の縮小版（variants.aipictors.com）だけ読めない画像 */
class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  referrerPolicy = ""
  crossOrigin: string | null = null
  complete = false
  naturalWidth = 0
  set src(value: string) {
    this.complete = true
    const ok = !value.startsWith("https://variants.aipictors.com/")
    this.naturalWidth = ok ? 96 : 0
    setTimeout(() => (ok ? this.onload?.() : this.onerror?.()), 0)
  }
  addEventListener(type: string, listener: () => void) {
    if (type === "load") this.onload = listener
    if (type === "error") this.onerror = listener
  }
  removeEventListener() {}
}

test("R2 に縮小版が無いアイコンは縮小の Worker の URL で出す", async () => {
  const original = window.Image
  window.Image = FakeImage as unknown as typeof window.Image
  try {
    const { container } = render(
      <Avatar>
        <AvatarImage src={ICON} alt="icon" />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>,
    )
    for (let i = 0; i < 5; i++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 5)))
    }
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://files.aipictors.com/_w/96/icon-1",
    )
  } finally {
    window.Image = original
  }
})
