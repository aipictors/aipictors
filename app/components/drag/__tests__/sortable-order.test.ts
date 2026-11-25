import { expect, test } from "bun:test"
import {
  type TSortableItem,
  toOverlayButtonSize,
} from "~/components/drag/sortable-item"
import { commitSortableOrder } from "~/components/drag/sortable-items"
import { toSortableKey } from "~/components/drag/sortable-key"

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
  expect(items.map(({ id, content }) => ({ id, content }))).toEqual([
    { id: 0, content: "c" },
    { id: 1, content: "a" },
    { id: 2, content: "b" },
  ])
})

test("並べ替えて id が変わっても、画像ごとの目印はそのまま", () => {
  const before = [
    { id: 0, content: "a" },
    { id: 1, content: "b" },
  ]
  const keys = before.map((item) => toSortableKey(item))
  let items: TSortableItem[] = []
  commitSortableOrder(
    [before[1], before[0]],
    () => {},
    (value) => {
      items = value
    },
  )
  expect(items.map((item) => item.content)).toEqual(["b", "a"])
  expect(items.map((item) => toSortableKey(item))).toEqual([keys[1], keys[0]])
  // もう一度並べ替えても同じ
  commitSortableOrder(
    [items[1], items[0]],
    () => {},
    (value) => {
      items = value
    },
  )
  expect(items.map((item) => toSortableKey(item))).toEqual(keys)
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
