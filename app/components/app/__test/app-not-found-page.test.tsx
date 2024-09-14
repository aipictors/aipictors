import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppNotFoundPage } from "../app-not-found-page"

describe("AppNotFoundPage", () => {
  it("404テキストが正しく表示されるかを確認", () => {
    render(
      <MemoryRouter>
        <AppNotFoundPage />
      </MemoryRouter>,
    )

    // 404テキストが正しく表示されるかを確認
    const headingElement = screen.getByText("404")
    expect(headingElement).toBeInTheDocument()
  })

  it("エラーメッセージが正しく表示されるかを確認", () => {
    render(
      <MemoryRouter>
        <AppNotFoundPage />
      </MemoryRouter>,
    )

    // エラーメッセージが正しく表示されるかを確認
    const messageElement = screen.getByText(
      "おっと! お探しのページは存在しないようです。",
    )
    expect(messageElement).toBeInTheDocument()
  })

  it("ホームに戻るボタンが正しく表示されるかを確認", () => {
    render(
      <MemoryRouter>
        <AppNotFoundPage />
      </MemoryRouter>,
    )

    // ホームに戻るボタンが正しく表示されるかを確認
    const linkElement = screen.getByRole("link", { name: /ホームに戻る/i })
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute("href", "https://www.aipictors.com")
  })
})
