import { expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

const { SearchQuerySummary } = await import(
  "~/routes/($lang)._main.search/components/search-query-summary"
)

const renderSummary = (props?: { activeFilterCount?: number }) => {
  const onSubmit = mock((_text: string) => undefined)
  const onClear = mock(() => undefined)
  const view = render(
    <SearchQuerySummary
      query="猫"
      onSubmit={onSubmit}
      onClear={onClear}
      activeFilterCount={props?.activeFilterCount ?? 0}
      trailing={<button type="button">R18</button>}
    />,
  )
  return { onSubmit, onClear, view }
}

const openEditor = () => {
  fireEvent.click(
    screen.getByRole("button", { name: "絞り込みを残したまま言葉を変える" }),
  )
  return screen.getByLabelText(
    "絞り込みを残したまま探し直す",
  ) as HTMLInputElement
}

test("ふだんは入力欄を出さず、検索語と全年齢 / R18 の切り替えだけ（検索欄はヘッダーの 1 つ）", () => {
  renderSummary()
  expect(screen.getByText("猫")).toBeTruthy()
  expect(screen.getByRole("button", { name: "R18" })).toBeTruthy()
  expect(screen.queryByRole("searchbox")).toBeNull()
})

test("「言葉を変える」で欄を出し、先頭の # を外して探し直す", () => {
  const { onSubmit } = renderSummary()
  const input = openEditor()
  expect(input.value).toBe("猫")
  fireEvent.change(input, { target: { value: " #犬 " } })
  fireEvent.submit(input.closest("form") as HTMLFormElement)
  expect(onSubmit).toHaveBeenCalledWith("犬")
})

test("同じ言葉のままなら探し直さずに閉じる。「やめる」でも閉じる", () => {
  const { onSubmit } = renderSummary()
  let input = openEditor()
  fireEvent.submit(input.closest("form") as HTMLFormElement)
  expect(onSubmit).not.toHaveBeenCalled()
  expect(screen.queryByRole("searchbox")).toBeNull()
  input = openEditor()
  fireEvent.change(input, { target: { value: "犬" } })
  fireEvent.click(screen.getByRole("button", { name: "やめる" }))
  expect(screen.queryByRole("searchbox")).toBeNull()
  expect(screen.getByText("猫")).toBeTruthy()
})

test("空にして送るか × を押すと検索語を外す", () => {
  const { onSubmit, onClear } = renderSummary()
  const input = openEditor()
  fireEvent.change(input, { target: { value: "  " } })
  fireEvent.submit(input.closest("form") as HTMLFormElement)
  expect(onSubmit).not.toHaveBeenCalled()
  expect(onClear).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole("button", { name: "やめる" }))
  fireEvent.click(screen.getByRole("button", { name: "検索語を外す" }))
  expect(onClear).toHaveBeenCalledTimes(2)
})

test("絞り込みを使っているときだけ数を出す", () => {
  const first = renderSummary({ activeFilterCount: 0 })
  expect(screen.queryByText("絞り込み 0")).toBeNull()
  first.view.unmount()
  renderSummary({ activeFilterCount: 2 })
  expect(screen.getByText("絞り込み 2")).toBeTruthy()
})
