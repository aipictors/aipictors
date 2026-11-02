import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppNotFoundPage } from "../app-not-found-page"

describe("AppNotFoundPage", () => {
  let _view: ReturnType<typeof render> | null = null

  beforeEach(() => {
    _view = render(
      <MemoryRouter>
        <AppNotFoundPage />
      </MemoryRouter>,
    )
  })

  it("404テキストが正しく表示されるかを確認", () => {
    // 404テキストが正しく表示されるかを確認
    const headingElement = screen.getByText("404")
    expect(headingElement).toBeInTheDocument()
  })

  it("見出しが正しく表示されるかを確認", () => {
    // 見出しが正しく表示されるかを確認
    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveTextContent("ページが見つかりません")
  })

  it("検索欄が表示されるかを確認", () => {
    // 検索欄が表示されるかを確認
    expect(screen.getByRole("searchbox")).toHaveAttribute("name", "q")
  })

  it("トップへ戻るリンクが正しく表示されるかを確認", () => {
    // トップへ戻るリンクが正しく表示されるかを確認
    const linkElement = screen.getByRole("link", {
      name: /トップページへ戻る/i,
    })
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute("href", "/")
  })
})
