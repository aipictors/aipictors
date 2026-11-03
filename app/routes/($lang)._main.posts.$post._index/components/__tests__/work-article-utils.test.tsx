import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { parseTextWithLinks } from "../work-article-description"
import {
  detectLanguage,
  toAiRankingPath,
  toDateTextUrl,
} from "../work-article-utils"

const ranking = (over: { periodType: string; isSensitive?: boolean }) => ({
  rank: 1,
  dateText: "2026-03-14",
  isSensitive: false,
  ...over,
})

test("AI ランキングのリンク先を期間ごとに作る", () => {
  expect(toAiRankingPath(ranking({ periodType: "daily" }) as never)).toBe(
    "/ai-rankings/2026/03/14",
  )
  expect(toAiRankingPath(ranking({ periodType: "monthly" }) as never)).toBe(
    "/ai-rankings/2026/03",
  )
  expect(toAiRankingPath(ranking({ periodType: "weekly" }) as never)).toMatch(
    /^\/ai-rankings\/2026\/\d+\/weeks\/\d+$/,
  )
})

test("R18 のランキングは /r の下、なければ null", () => {
  expect(
    toAiRankingPath(
      ranking({ periodType: "daily", isSensitive: true }) as never,
    ),
  ).toBe("/r/ai-rankings/2026/03/14")
  expect(toAiRankingPath(null)).toBeNull()
})

test("言語の判定", () => {
  expect(detectLanguage("こんにちは world")).toBe("ja")
  expect(detectLanguage("hello")).toBe("en")
  expect(detectLanguage("안녕")).toBeNull()
  expect(detectLanguage("1234")).toBeNull()
})

test("入賞のリンクの日付は秒の時刻から作る", () => {
  const time = Date.UTC(2026, 0, 15, 12) / 1000
  expect(toDateTextUrl(time, "yyyy")).toBe("2026")
})

test("説明の URL だけをリンクにする", () => {
  const html = renderToStaticMarkup(
    <p>
      {parseTextWithLinks("前 https://example.com/a 中 http://example.com/b")}
    </p>,
  )
  expect(html).toBe(
    '<p>前 <a target="_blank" rel="noopener noreferrer" class="text-blue-500" href="https://example.com/a">https://example.com/a</a> 中 <a target="_blank" rel="noopener noreferrer" class="text-blue-500" href="http://example.com/b">http://example.com/b</a></p>',
  )
})
