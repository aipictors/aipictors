import { describe, expect, test } from "bun:test"
import {
  isTagPageDefaultView,
  parseTagPageQuery,
} from "~/routes/($lang)._main.tags.$tag._index/tag-page-query"

const parse = (search: string) => parseTagPageQuery(new URLSearchParams(search))

describe("isTagPageDefaultView", () => {
  test("並び替え・絞り込みのない一覧（ページ送りを含む）は既定の表示", () => {
    expect(isTagPageDefaultView(parse(""))).toBe(true)
    expect(isTagPageDefaultView(parse("page=3"))).toBe(true)
    expect(isTagPageDefaultView(parse("orderBy=LIKES_COUNT"))).toBe(true)
  })

  test("並び替え・絞り込みの付いた一覧は既定の表示ではない", () => {
    expect(isTagPageDefaultView(parse("orderBy=DATE_CREATED"))).toBe(false)
    expect(isTagPageDefaultView(parse("sort=ASC"))).toBe(false)
    expect(isTagPageDefaultView(parse("rating=G"))).toBe(false)
    expect(isTagPageDefaultView(parse("prompt=1&page=2"))).toBe(false)
  })
})
