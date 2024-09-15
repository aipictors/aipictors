import { render, screen } from "@testing-library/react"
import About from "../route"
import { BrowserRouter as Router } from "react-router-dom"

describe("About component tests", () => {
  const setup = () =>
    render(
      <Router>
        <About />
      </Router>,
    )

  it("should render the main heading about the site", () => {
    setup()
    expect(screen.getByText("本サイトについて")).toBeInTheDocument()
  })

  it("should render the correct subheadings", () => {
    setup()
    expect(screen.getByText("当サービスについて")).toBeInTheDocument()
    expect(screen.getByText("運営会社について")).toBeInTheDocument()
    expect(screen.getByText("お問い合わせ先")).toBeInTheDocument()
    expect(screen.getByText("プライバシーポリシー")).toBeInTheDocument()
    expect(screen.getByText("利用規約")).toBeInTheDocument()
    expect(screen.getByText("ガイドライン")).toBeInTheDocument()
    expect(screen.getByText("ロゴ")).toBeInTheDocument()
  })

  it("should provide correct company information", () => {
    setup()
    expect(
      screen.getByText(
        "Aipictors株式会社が運営しております。お問い合わせは hello@aipictors.com からお願い致します。",
      ),
    ).toBeInTheDocument()
  })

  it("should contain links with correct destinations", () => {
    setup()

    // "お問い合わせ先"の下にある"こちら"リンク
    expect(
      screen.getByText("お問い合わせ先").nextElementSibling?.closest("a"),
    ).toHaveAttribute("href", "/contact")

    // "プライバシーポリシー"の下にあるリンク
    expect(
      screen.getByText("個人情報の利用目的などについて").closest("a"),
    ).toHaveAttribute("href", "/privacy")

    // "利用規約"の段落にある"こちら"リンク
    expect(screen.getAllByText("こちら")[1].closest("a")).toHaveAttribute(
      "href",
      "/terms",
    )

    // "ガイドライン"の段落にある"こちら"リンク
    expect(screen.getAllByText("こちら")[2].closest("a")).toHaveAttribute(
      "href",
      "/guideline",
    )

    // "ロゴ"の段落にある"こちら"リンク
    expect(screen.getAllByText("こちら")[3].closest("a")).toHaveAttribute(
      "href",
      "https://www.aipictors.com/presskit/",
    )
  })

  it("should check if all texts are in bold and the correct font sizes are applied to headings", () => {
    setup()
    const headings = screen.getAllByRole("heading")
    for (const heading of headings) {
      expect(heading).toHaveClass("font-bold")
      const level = heading.tagName.toLowerCase()
      if (level === "h1") {
        expect(heading).toHaveClass("text-2xl")
      } else if (level === "h2") {
        expect(heading).toHaveClass("text-md")
      }
    }
  })
})
