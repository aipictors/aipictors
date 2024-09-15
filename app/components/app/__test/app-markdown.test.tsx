import { render, screen } from "@testing-library/react"
import { AppMarkdown } from "../app-markdown"

describe("AppMarkdownコンポーネントのテスト", () => {
  it("子要素がそのままレンダリングされることを確認", () => {
    const childElement = <span>This is a child element</span>
    render(<AppMarkdown>{childElement}</AppMarkdown>)

    expect(screen.getByText("This is a child element")).toBeInTheDocument()
  })

  it("マークダウンが正しくHTMLに変換されてレンダリングされることを確認", () => {
    const markdownContent = "# Heading\n\nThis is a paragraph."
    render(<AppMarkdown>{markdownContent}</AppMarkdown>)
    expect(
      screen.getByRole("heading", { level: 1, name: "Heading" }),
    ).toBeInTheDocument()
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument()
  })

  it("指定した className が適用されていることを確認", () => {
    const markdownContent = "Some markdown content"
    render(<AppMarkdown className="test-class">{markdownContent}</AppMarkdown>)

    const markdownContainer = screen.getByText(
      "Some markdown content",
    ).parentElement
    expect(markdownContainer).toHaveClass("test-class")
  })
})
