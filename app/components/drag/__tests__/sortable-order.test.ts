import { expect, test } from "bun:test"
import { toOverlayButtonSize } from "~/components/drag/sortable-item"
import { commitSortableOrder } from "~/components/drag/sortable-items"

test("並びを確定すると、元の id の並びを渡し、id を並び順に振り直す", () => {
  let indexList: number[] = []
  let items: { id: number; content: string }[] = []
  commitSortableOrder(
    [
      { id: 2, content: "c" },
      { id: 0, content: "a" },
      { id: 1, content: "b" },
    ],
    (value) => {
      indexList = value
    },
    (value) => {
      items = value as typeof items
    },
  )
  expect(indexList).toEqual([2, 0, 1])
  expect(items).toEqual([
    { id: 0, content: "c" },
    { id: 1, content: "a" },
    { id: 2, content: "b" },
  ])
})

test("小さい画像ではボタンを小さくし、いちばん小さいときは外すボタンだけにする", () => {
  expect(toOverlayButtonSize(150)).toMatchObject({
    button: "size-8",
    isCompact: false,
  })
  expect(toOverlayButtonSize(76)).toMatchObject({
    button: "size-6",
    isCompact: false,
  })
  expect(toOverlayButtonSize(60)).toMatchObject({
    button: "size-5",
    isCompact: true,
  })
})
