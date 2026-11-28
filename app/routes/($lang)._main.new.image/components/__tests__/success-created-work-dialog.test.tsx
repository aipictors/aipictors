import { afterEach, expect, test } from "bun:test"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { SuccessCreatedWorkDialog } from "../success-created-work-dialog"

const originalLocation = window.location

afterEach(() => {
  cleanup()
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  })
})

/** window.location.href への代入を記録する */
function stubLocation() {
  const assigned: string[] = []
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...originalLocation,
      pathname: "/new/image",
      set href(value: string) {
        assigned.push(value)
      },
      get href() {
        return "https://www.aipictors.com/new/image"
      },
    },
  })
  return assigned
}

const renderDialog = (imageBase64: string | null) =>
  render(
    <MemoryRouter>
      <SuccessCreatedWorkDialog
        title="テスト作品"
        description=""
        isOpen
        imageBase64={imageBase64}
        workId="123"
        uuid="uuid-1"
        shareTags={[]}
        createdAt={Number.NaN}
        accessType="PUBLIC"
      />
    </MemoryRouter>,
  )

test("サムネイルは作品ページへのリンクで、押すとダイアログを閉じて移動する", () => {
  const assigned = stubLocation()
  renderDialog("data:image/png;base64,AAAA")
  const thumbnail = screen.getAllByRole("link", { name: "作品を見る" })[0]
  expect(thumbnail?.getAttribute("href")).toBe("/posts/123")
  if (thumbnail === undefined) throw new Error("thumbnail not found")
  fireEvent.click(thumbnail)
  expect(assigned).toEqual(["/posts/123"])
  expect(screen.queryByText("作品が更新されました")).toBeNull()
})

test("サムネイルが無くても作品ページへのリンクになる", () => {
  stubLocation()
  renderDialog(null)
  const thumbnail = screen.getAllByRole("link", { name: "作品を見る" })[0]
  expect(thumbnail?.getAttribute("href")).toBe("/posts/123")
})

test("Ctrl / ⌘ を押しながらのクリックは新しいタブに任せる", () => {
  const assigned = stubLocation()
  renderDialog("data:image/png;base64,AAAA")
  const thumbnail = screen.getAllByRole("link", { name: "作品を見る" })[0]
  if (thumbnail === undefined) throw new Error("thumbnail not found")
  fireEvent.click(thumbnail, { metaKey: true })
  expect(assigned).toEqual([])
})
