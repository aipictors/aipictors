import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import {
  AI_MODEL_WORKS_MAX_PAGE,
  AI_MODEL_WORKS_OFFSET_MAX,
  AI_MODEL_WORKS_PER_PAGE,
  parseAiModelWorksSearch,
  toAiModelPopularTags,
  toAiModelWorksPageCount,
  toAiModelWorksPageItems,
  toAiModelWorksQuery,
} from "~/routes/($lang)._main.models.$model/ai-model-works-page"
import { findAiModelImageModels } from "~/routes/($lang)._main.models.$model/ai-model-image-models"
import { toAiModelPageText } from "~/routes/($lang)._main.models.$model/ai-model-seo"

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
    test(`${path} は取得の件数が同じ`, () => {
      const source = readFileSync(path, "utf8")

      // 32 件ずつ取るのにページ送りを 16 件で数えると、後半のページが空になる
      expect(source).toContain("limit: AI_MODEL_WORKS_PER_PAGE")
      expect(source).not.toMatch(/limit: \d+/)
    })

    test(`${path} は件数を一覧と同じ条件で数える`, () => {
      const source = readFileSync(path, "utf8")

      // 条件なしだと既定の年齢区分（全年齢）の件数になり、R18 やプロンプト有の一覧とずれる
      expect(source).toContain("worksCount(where: $where)")
    })

    test(`${path} はローダーと同じ並び順で取り直す`, () => {
      const source = readFileSync(path, "utf8")

      expect(source).toContain(
        "orderBy: toAiModelWorksOrderBy(props.search.sort)",
      )
    })
  }

  for (const path of loaderPaths) {
    test(`${path} は同じ件数ずつ取る`, () => {
      const source = readFileSync(path, "utf8")

      expect(source).toContain("offset: page * AI_MODEL_WORKS_PER_PAGE")
      expect(source).toContain("limit: AI_MODEL_WORKS_PER_PAGE")
      expect(source).toContain("orderBy: toAiModelWorksOrderBy(search.sort)")
    })
  }

  test("ページ数は 32 件ずつで数える", () => {
    expect(toAiModelWorksPageCount(0)).toBe(1)
    expect(toAiModelWorksPageCount(32)).toBe(1)
    expect(toAiModelWorksPageCount(87)).toBe(3)
  })

  test("ページは API の offset の上限までにする", () => {
    // 上限を超えた offset は丸められ、後ろのページが最後のページと同じ作品のくり返しになる
    expect(
      AI_MODEL_WORKS_MAX_PAGE * AI_MODEL_WORKS_PER_PAGE,
    ).toBeLessThanOrEqual(AI_MODEL_WORKS_OFFSET_MAX)
    expect(
      (AI_MODEL_WORKS_MAX_PAGE + 1) * AI_MODEL_WORKS_PER_PAGE,
    ).toBeGreaterThan(AI_MODEL_WORKS_OFFSET_MAX)
    expect(toAiModelWorksPageCount(15522)).toBe(AI_MODEL_WORKS_MAX_PAGE + 1)
    expect(
      parseAiModelWorksSearch(new URLSearchParams("page=300"), "r15").page,
    ).toBe(AI_MODEL_WORKS_MAX_PAGE)
  })

  test("ページ番号は前後と最初・最後を出して間を省く", () => {
    expect(toAiModelWorksPageItems(2, 3)).toEqual([0, 1, 2])
    expect(toAiModelWorksPageItems(0, 10)).toEqual([0, 1, 2, 3, null, 9])
    expect(toAiModelWorksPageItems(4, 10)).toEqual([0, null, 3, 4, 5, null, 9])
    expect(toAiModelWorksPageItems(9, 10)).toEqual([0, null, 6, 7, 8, 9])
  })
})

describe("モデルの作品一覧の URL", () => {
  test("以前の URL（?page=2&prompt=0&r15=0&cb=...）をそのまま読める", () => {
    expect(
      parseAiModelWorksSearch(
        new URLSearchParams("page=2&prompt=0&r15=0&cb=8812"),
        "r15",
      ),
    ).toEqual({ page: 2, hasPrompt: false, isMoreRatings: false, sort: "new" })
  })

  test("おかしなページ番号は 1 ページ目にする", () => {
    for (const page of ["-1", "abc", ""]) {
      expect(
        parseAiModelWorksSearch(new URLSearchParams(`page=${page}`), "r15")
          .page,
      ).toBe(0)
    }
  })

  test("既定の値は URL に付けない", () => {
    expect(
      toAiModelWorksQuery(
        { page: 0, hasPrompt: false, isMoreRatings: false, sort: "new" },
        "r15",
      ),
    ).toBe("")
    expect(
      toAiModelWorksQuery(
        { page: 1, hasPrompt: true, isMoreRatings: true, sort: "likes" },
        "r18g",
      ),
    ).toBe("?page=1&prompt=1&r18g=1&sort=likes")
  })
})

describe("モデルの作品一覧のタイトルと説明", () => {
  test("作品数と先頭の作品名を入れ、2 ページ目以降はページ番号も入れる", () => {
    const first = toAiModelPageText({
      name: "fudukiMixV2",
      worksCount: 87,
      page: 0,
      pageCount: 3,
      workTitles: ["森の戯れ", "森の泉の女神様2"],
      modelType: "SDXL",
    })
    expect(first.title).toBe("fudukiMixV2のAIイラスト作品一覧（87件）")
    expect(first.description).toContain("「森の戯れ」「森の泉の女神様2」など。")
    expect(first.description).toContain("SDXL")

    const third = toAiModelPageText({
      name: "fudukiMixV2",
      worksCount: 87,
      page: 2,
      pageCount: 3,
      workTitles: [],
      modelType: null,
    })
    expect(third.title).toContain("（3/3ページ）")
    expect(third.description).toContain("3ページ目")
  })

  test("英語のタイトルは空にならない", () => {
    const text = toAiModelPageText({
      name: "fudukiMixV2",
      worksCount: 87,
      page: 0,
      pageCount: 3,
      workTitles: [],
      modelType: null,
      lang: "en",
    })
    expect(text.title).toBe("fudukiMixV2 AI Art & Prompts - 87 works")
  })
})

describe("よく付いているタグ", () => {
  test("多い順に並べる", () => {
    expect(
      toAiModelPopularTags(
        [
          { tags: [{ name: "猫" }, { name: "女の子" }] },
          { tags: [{ name: "女の子" }, { name: " " }] },
        ],
        5,
      ),
    ).toEqual([
      { name: "女の子", count: 2 },
      { name: "猫", count: 1 },
    ])
  })
})

describe("似ているモデル", () => {
  const imageModels = [
    {
      id: "1",
      modelName: "a",
      displayName: "A",
      explanation: "",
      type: "SDXL",
      style: "REAL" as const,
      thumbnailImageURL: null,
    },
    {
      id: "2",
      modelName: "b",
      displayName: "B",
      explanation: "",
      type: "SDXL",
      style: "ILLUSTRATION" as const,
      thumbnailImageURL: null,
    },
    {
      id: "3",
      modelName: "c",
      displayName: "C",
      explanation: "",
      type: "SD1",
      style: "REAL" as const,
      thumbnailImageURL: null,
    },
    {
      id: "4",
      modelName: "d",
      displayName: "D",
      explanation: "",
      type: "SDXL",
      style: "REAL" as const,
      thumbnailImageURL: null,
    },
  ]

  test("同じ種類でスタイルが同じものを先に出す", () => {
    const result = findAiModelImageModels(
      imageModels,
      { name: "a", generationModelId: "1" },
      5,
    )
    expect(result.current?.id).toBe("1")
    expect(result.related.map((item) => item.id)).toEqual(["4", "2"])
  })

  test("画像生成にないモデルは何も出さない", () => {
    expect(
      findAiModelImageModels(
        imageModels,
        { name: "x", generationModelId: null },
        5,
      ),
    ).toEqual({ current: null, related: [] })
  })
})
