import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StarRating } from "../star-rating"

test("星は5つ表示される", () => {
  render(<StarRating value={0} onChange={() => {}} />)
  expect(screen.getAllByRole("button")).toHaveLength(5)
})

test("4つ目の星を押すと4が渡る", async () => {
  const values: number[] = []
  render(<StarRating value={0} onChange={(value) => values.push(value)} />)

  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "お気に入り 4" }))

  expect(values).toEqual([4])
})

test("同じ星をもう一度押すと0に戻る", async () => {
  const values: number[] = []
  render(<StarRating value={5} onChange={(value) => values.push(value)} />)

  const user = userEvent.setup()
  await user.click(screen.getByRole("button", { name: "お気に入り 5" }))

  expect(values).toEqual([0])
})

/**
 * 生成履歴の詳細から星での評価が消えた不具合の再発防止
 */
test("生成履歴の詳細に星での評価がある", () => {
  const source = readFileSync(
    new URL("../../generation-task-sheet-view-content.tsx", import.meta.url)
      .pathname,
    "utf-8",
  )
  expect(source).toContain("<StarRating")
})
