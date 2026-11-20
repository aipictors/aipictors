import { expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { GenerationConfigSeed } from "~/routes/($lang).generation._index/components/config-view/generation-config-seed"

const renderSeed = (
  value: number,
  onChange: (value: number) => void = () => {},
) =>
  render(
    <MemoryRouter initialEntries={["/ja/generation"]}>
      <GenerationConfigSeed value={value} onChange={onChange} />
    </MemoryRouter>,
  )

const randomButton = () =>
  screen.getByRole("button", { name: "ランダムなシード" })

/** アクセント色（水色）の地のボタンか */
const isAccent = (element: HTMLElement) =>
  element.className.includes("bg-[#0077d9]")

test("ランダム（-1）のときは色の付いたボタンになる", () => {
  renderSeed(-1)

  expect(isAccent(randomButton())).toBe(true)
})

test("Seed を決めているときは色を付けない", () => {
  renderSeed(1234)

  expect(isAccent(randomButton())).toBe(false)
})

test("押すと -1 になる", async () => {
  const values: number[] = []
  renderSeed(1234, (value) => values.push(value))

  const user = userEvent.setup()
  await user.click(randomButton())

  expect(values).toEqual([-1])
})
