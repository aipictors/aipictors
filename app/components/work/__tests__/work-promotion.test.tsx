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

test("おすすめ作品はどの幅でも 2 段ぴったり（PC は大きく出す 1 件が 4 マス）", () => {
  // 宣伝なし: 2 列 4 件・3 列 6 件・4 列 8 件
  expect(visibleCounts(0, 10)).toEqual([4, 6, 8])
  // 宣伝 1 件: スマホは普通の大きさで 4 件、PC は 2×2 の 1 件＋残りのマス
  expect(visibleCounts(1, 10)).toEqual([4, 3, 5])
  expect(visibleCounts(3, 10)).toEqual([4, 3, 5])
})

test("宣伝が多いときは宣伝を隠さず、段を増やして埋める", () => {
  // 宣伝 5 件: 2 列は 3 段（6 件）、3 列は 3 段（9 マス = 6 件）、4 列は 2 段（8 マス = 5 件）
  expect(visibleCounts(5, 10)).toEqual([6, 6, 5])
  // 宣伝 6 件: 4 列は 3 段（12 マス = 9 件）
  expect(visibleCounts(6, 10)).toEqual([6, 6, 9])
})

test("おすすめが足りない幅は段を減らし、宣伝の段だけは案内で埋める", () => {
  // 宣伝 1・おすすめ 0 → スマホは 1 段（案内 1）、PC は 2×2 の 2 段ぶん（3 列で案内 2、4 列で案内 4）
  expect(visibleCounts(1, 0)).toEqual([2, 3, 5])
  expect(toHomePicksLayout(1, 0).inviteCount).toBe(4)
  expect(toHomePicksLayout(0, 0).isEmpty).toBe(true)
})

// 一覧のリンクはルーターが要るので、リンクの無い見本の形で見た目だけ確かめる
test("宣伝の作品には PR の印、宣伝ではないおすすめには印も宣伝の枠も付けない", () => {
  const promoted = renderToStaticMarkup(
    <Card title="宣伝" userName="作者" imageUrl="https://img.test/a" />,
  )
  const plain = renderToStaticMarkup(
    <Card
      title="おすすめ"
      userName="作者"
      imageUrl="https://img.test/b"
      isPlain
    />,
  )

  expect(promoted).toContain(">PR<")
  expect(promoted).toContain("from-amber-400")
  expect(plain).not.toContain(">PR<")
  // 作者のアイコンは宣伝のカードだけ少し大きい
  expect(promoted).toContain("size-6")
  expect(plain).not.toContain("size-6")
  expect(plain).not.toContain("from-amber-400")
})
