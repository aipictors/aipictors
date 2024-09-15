import { render, screen } from "@testing-library/react"
import { AppMarkdown } from "../app-markdown" // コンポーネントをインポート

describe("AppMarkdown", () => {
  it("renders children as is if not a string", () => {
    const childElement = <span>This is a child element</span>
    render(<AppMarkdown>{childElement}</AppMarkdown>)

    // 子要素がそのままレンダリングされることを確認
    expect(screen.getByText("This is a child element")).toBeInTheDocument()
  })

  it("renders markdown content correctly", () => {
    const markdownContent = "# Heading\n\nThis is a paragraph."
    render(<AppMarkdown>{markdownContent}</AppMarkdown>)

    // マークダウンが正しくHTMLに変換されてレンダリングされることを確認
    expect(
      screen.getByRole("heading", { level: 1, name: "Heading" }),
    ).toBeInTheDocument()
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument()
  })

  it("applies className correctly", () => {
    const markdownContent = "Some markdown content"
    render(<AppMarkdown className="test-class">{markdownContent}</AppMarkdown>)

    // 指定した className が適用されていることを確認
    const markdownContainer = screen.getByText(
      "Some markdown content",
    ).parentElement
    expect(markdownContainer).toHaveClass("test-class")
  })
})
