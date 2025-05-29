import { render, screen } from "@testing-library/react"
import type { FragmentOf } from "gql.tada"
import {
  HomeTagList,
  type HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"

// モックデータ
const mockHotTags: FragmentOf<typeof HomeTagListItemFragment>[] = [
  { id: "tag1", name: "タグ1" },
  { id: "tag2", name: "タグ2" },
]

describe("HomeTagList", () => {
  it("コンポーネントが正しくレンダリングされる", () => {
    const { asFragment } = render(<HomeTagList hotTags={mockHotTags} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it("themeTitleが指定されている場合、今日のお題ボタンが表示される", () => {
    render(<HomeTagList hotTags={mockHotTags} themeTitle="テストお題" />)

    const themeButton = screen.getByRole("link", {
      name: /今日のお題「テストお題」/i,
    })
    expect(themeButton).toBeInTheDocument()
    expect(themeButton).toHaveAttribute("href", "/themes/2025/5/30")
  })

  it("themeTitleが指定されていない場合、今日のお題ボタンが表示されない", () => {
    render(<HomeTagList hotTags={mockHotTags} />)

    const themeButton = screen.queryByRole("link", { name: /今日のお題/i })
    expect(themeButton).not.toBeInTheDocument()
  })

  it("hotTagsが正しくレンダリングされる", () => {
    render(<HomeTagList hotTags={mockHotTags} />)

    const tagButtons = screen.getAllByRole("link", { name: /タグ/i })
    expect(tagButtons).toHaveLength(2)
    expect(tagButtons[0]).toHaveTextContent("タグ1")
    expect(tagButtons[0]).toHaveAttribute("href", "/tags/タグ1")
    expect(tagButtons[1]).toHaveTextContent("タグ2")
    expect(tagButtons[1]).toHaveAttribute("href", "/tags/タグ2")
  })

  it("hotTagsが空の場合、タグボタンが表示されない", () => {
    render(<HomeTagList hotTags={[]} />)

    const tagButtons = screen.queryAllByRole("link", { name: /タグ/i })
    expect(tagButtons).toHaveLength(0)
  })
})
