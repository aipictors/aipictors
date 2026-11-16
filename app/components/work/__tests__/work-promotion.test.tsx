import { expect, mock, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"

mock.module("~/hooks/use-translation", () => ({
  useTranslation: () => (jaText: string, _enText: string) => jaText,
}))

const { PromotionWorkCard, WorkPromotionBanner } = await import(
  "~/components/work/work-promotion"
)

test("作品ページの宣伝の帯は関連リンクへのボタンを出す", () => {
  const html = renderToStaticMarkup(
    <WorkPromotionBanner userName="作者" relatedUrl="https://shop.test/a" />,
  )

  expect(html).toContain('href="https://shop.test/a"')
  expect(html).toContain("詳しく見る")
})

test("見本の帯と見本のカードは「詳しく見る」を押せない（見本の URL に飛ばない）", () => {
  const banner = renderToStaticMarkup(
    <WorkPromotionBanner
      userName="あなた"
      relatedUrl="https://example.com"
      isPreview
    />,
  )
  const card = renderToStaticMarkup(
    <PromotionWorkCard
      title="あなたの作品のタイトル"
      userName="あなた"
      relatedUrl="https://example.com"
    />,
  )

  for (const html of [banner, card]) {
    expect(html).toContain("詳しく見る")
    expect(html).not.toContain("href=")
  }
})
