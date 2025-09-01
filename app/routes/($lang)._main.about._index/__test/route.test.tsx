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
    expect(screen.getByText("使い方ガイド")).toBeInTheDocument()
    expect(screen.getByText("ロードマップ")).toBeInTheDocument()
    expect(screen.getByText("プレスキット")).toBeInTheDocument()
  })

  it("should provide correct company information", () => {
    setup()
    expect(
      screen.getByText(
        "Aipictors株式会社が運営しております。お問い合わせは aipictors@gmail.com からお願い致します。",
      ),
    ).toBeInTheDocument()
  })

  it("should contain links with correct destinations", () => {
    setup()

    // "お問い合わせ先"のリンクを確認
    const contactLink = screen.getByText("お問い合わせ先").closest("a")
    expect(contactLink).toBeTruthy()
    if (contactLink) {
      expect(contactLink.getAttribute("href")).toBe("/contact")
    }

    // "プライバシーポリシー"のリンクを確認
    const privacyLink = screen.getByText("プライバシーポリシー").closest("a")
    expect(privacyLink).toBeTruthy()
    if (privacyLink) {
      expect(privacyLink.getAttribute("href")).toBe("/privacy")
    }

    // "利用規約"のリンクを確認
    const termsLink = screen.getByText("利用規約").closest("a")
    expect(termsLink).toBeTruthy()
    if (termsLink) {
      expect(termsLink.getAttribute("href")).toBe("/terms")
    }

    // "ガイドライン"のリンクを確認
    const guidelineLink = screen.getByText("ガイドライン").closest("a")
    expect(guidelineLink).toBeTruthy()
    if (guidelineLink) {
      expect(guidelineLink.getAttribute("href")).toBe("/guideline")
    }

    // "使い方ガイド"のリンクを確認
    const helpLink = screen.getByText("使い方ガイド").closest("a")
    expect(helpLink).toBeTruthy()
    if (helpLink) {
      expect(helpLink.getAttribute("href")).toBe("/help")
    }

    // "プレスキット"のリンクを確認
    const presskitLink = screen.getByText("プレスキット").closest("a")
    expect(presskitLink).toBeTruthy()
    if (presskitLink) {
      expect(presskitLink.getAttribute("href")).toBe("/presskit")
    }
  })

  it("should check if main heading has correct styling", () => {
    setup()
    const mainHeading = screen.getByText("本サイトについて")
    expect(mainHeading).toBeTruthy()
    // メインタイトルはh1要素であることを確認
    expect(mainHeading.tagName.toLowerCase()).toBe("h1")
    // フォントボールドクラスがあることを確認
    expect(mainHeading.className).toContain("font-bold")
    // 大きなフォントサイズクラスがあることを確認
    expect(mainHeading.className).toContain("text-4xl")
  })
})
