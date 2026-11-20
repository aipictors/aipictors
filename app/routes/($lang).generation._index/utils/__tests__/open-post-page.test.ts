import { expect, test } from "bun:test"
import { openPostPage } from "../open-post-page"

const createOpener = (open: () => Window | null) => {
  const navigated: string[] = []
  const opened: string[] = []
  return {
    navigated,
    opened,
    opener: {
      open: (url: string) => {
        opened.push(url)
        return open()
      },
      navigate: (url: string) => {
        navigated.push(url)
      },
    },
  }
}

test("新しいタブが開けたときは同じタブでは開かない", () => {
  const { navigated, opened, opener } = createOpener(() => ({}) as Window)

  openPostPage("/new/image?generation=abc", opener)

  expect(opened).toEqual(["/new/image?generation=abc"])
  expect(navigated).toEqual([])
})

test("新しいタブがブロックされたら同じタブで開く", () => {
  const { navigated, opener } = createOpener(() => null)

  openPostPage("/new/image?generation=abc", opener)

  expect(navigated).toEqual(["/new/image?generation=abc"])
})

test("window.open が例外になっても同じタブで開く", () => {
  const { navigated, opener } = createOpener(() => {
    throw new Error("blocked")
  })

  openPostPage("/new/image?generation=abc", opener)

  expect(navigated).toEqual(["/new/image?generation=abc"])
})
