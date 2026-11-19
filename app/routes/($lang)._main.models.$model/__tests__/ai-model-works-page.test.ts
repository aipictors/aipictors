import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

const articlePaths = [
  "app/routes/($lang)._main.models.$model/components/ai-model-article.tsx",
  "app/routes/($lang)._main.models.$model/components/ai-model-sensitive-article.tsx",
]

const loaderPaths = [
  "app/routes/($lang)._main.models.$model/route.tsx",
  "app/routes/($lang).r.models.$model/route.tsx",
]

describe("モデルの作品一覧のページ送り", () => {
  for (const path of articlePaths) {
    test(`${path} はページ送りと取得の件数が同じ`, () => {
      const source = readFileSync(path, "utf8")

      // 32 件ずつ取るのにページ送りを 16 件で数えると、後半のページが空になる
      expect(source).toContain("perPage={AI_MODEL_WORKS_PER_PAGE}")
      expect(source).toContain("limit: AI_MODEL_WORKS_PER_PAGE")
      expect(source).not.toMatch(/perPage=\{\d+\}/)
      expect(source).not.toMatch(/limit: \d+/)
    })

    test(`${path} は件数を一覧と同じ条件で数える`, () => {
      const source = readFileSync(path, "utf8")

      // 条件なしだと既定の年齢区分（全年齢）の件数になり、R18 やプロンプト有の一覧とずれる
      expect(source).toContain("worksCount(where: $where)")
    })
  }

  for (const path of loaderPaths) {
    test(`${path} は同じ件数ずつ取る`, () => {
      const source = readFileSync(path, "utf8")

      expect(source).toContain("offset: page * AI_MODEL_WORKS_PER_PAGE")
      expect(source).toContain("limit: AI_MODEL_WORKS_PER_PAGE")
    })
  }
})
