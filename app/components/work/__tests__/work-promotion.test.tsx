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

const { toHomePicksLayout, PromotionWorkCard: Card } = await import(
  "~/components/work/work-promotion"
)

/** 幅ごと（2 / 3 / 4 列）に、一覧の何件目までが見えるか */
const visibleCounts = (promotionCount: number, fillCount: number) => {
  const layout = toHomePicksLayout(promotionCount, fillCount)
  const total = promotionCount + layout.fillCount + layout.inviteCount
  return ["max-lg:hidden", "lg:max-xl:hidden", "xl:hidden"].map(
    (hidden) =>
      Array.from({ length: total }, (_, i) => i).filter(
        (i) => !layout.hiddenClassName(i).split(" ").includes(hidden),
      ).length,
  )
}

test("おすすめ作品は宣伝の件数によらず、どの幅でも 2 段ぴったり（空きマスなし）", () => {
  expect(visibleCounts(0, 10)).toEqual([4, 6, 8])
  expect(visibleCounts(1, 10)).toEqual([4, 6, 8])
  expect(visibleCounts(3, 10)).toEqual([4, 6, 8])
})

test("宣伝が多いときは宣伝を隠さず、段を増やして埋める", () => {
  // 2 列で 5 件の宣伝 → 3 段（6 件）、3 列・4 列はそのまま 2 段
  expect(visibleCounts(5, 10)).toEqual([6, 6, 8])
  expect(visibleCounts(6, 10)).toEqual([6, 6, 8])
})

test("おすすめが足りない幅は段を減らし、宣伝の段だけは案内で埋める", () => {
  // 宣伝 1・おすすめ 2 → どの幅でも 1 段（宣伝の段が 3 / 4 列で埋まらない分は案内）
  expect(visibleCounts(1, 2)).toEqual([2, 3, 4])
  expect(toHomePicksLayout(1, 2).inviteCount).toBe(1)
  expect(toHomePicksLayout(0, 0).isEmpty).toBe(true)
})

// 一覧のリンクはルーターが要るので、リンクの無い見本の形で見た目だけ確かめる
test("宣伝の作品には PR の印、宣伝ではないおすすめには印も宣伝の枠も付けない", () => {
  const promoted = renderToStaticMarkup(
    <Card title="宣伝" imageUrl="https://img.test/a" />,
  )
  const plain = renderToStaticMarkup(
    <Card title="おすすめ" imageUrl="https://img.test/b" isPlain />,
  )

  expect(promoted).toContain(">PR<")
  expect(promoted).toContain("from-amber-400")
  expect(plain).not.toContain(">PR<")
  expect(plain).not.toContain("from-amber-400")
})
