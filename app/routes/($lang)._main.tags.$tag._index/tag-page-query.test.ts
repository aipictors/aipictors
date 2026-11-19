import { describe, expect, test } from "bun:test"
import {
  isTagPageDefaultView,
  parseTagPageQuery,
  TAG_PAGE_MAX_PAGE,
  TAG_PAGE_OFFSET_MAX,
  TAG_PAGE_SIZE,
  toRatings,
  toTagPageSearch,
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
    expect(isTagPageDefaultView(parse("rating=all"))).toBe(false)
    expect(isTagPageDefaultView(parse("rating=R15"))).toBe(false)
    expect(isTagPageDefaultView(parse("prompt=1&page=2"))).toBe(false)
  })
})

describe("parseTagPageQuery の年齢区分", () => {
  test("指定がなければ全年齢（G）だけ", () => {
    expect(parse("").rating).toBe("G")
    expect(parse("rating=unknown").rating).toBe("G")
    expect(toRatings(parse("").rating)).toEqual(["G"])
  })

  test("rating=all は全年齢と R15", () => {
    expect(parse("rating=all").rating).toBe("all")
    expect(toRatings(parse("rating=all").rating)).toEqual(["G", "R15"])
  })

  test("既定の全年齢は URL に出さず、すべては rating=all にする", () => {
    expect(toTagPageSearch({ rating: "G" })).toBe("")
    expect(toTagPageSearch({ rating: "all" })).toBe("?rating=all")
    expect(toTagPageSearch({ rating: "R15" })).toBe("?rating=R15")
  })
})

describe("TAG_PAGE_MAX_PAGE", () => {
  test("最後のページの offset が API の上限を超えない（超えると前のページと同じ作品がくり返し出る）", () => {
    expect(TAG_PAGE_MAX_PAGE * TAG_PAGE_SIZE).toBeLessThanOrEqual(
      TAG_PAGE_OFFSET_MAX,
    )
    expect((TAG_PAGE_MAX_PAGE + 1) * TAG_PAGE_SIZE).toBeGreaterThan(
      TAG_PAGE_OFFSET_MAX,
    )
  })

  test("上限より後ろのページの URL は最後のページとして読む", () => {
    expect(parse("page=60").page).toBe(TAG_PAGE_MAX_PAGE)
    expect(parse(`page=${TAG_PAGE_MAX_PAGE}`).page).toBe(TAG_PAGE_MAX_PAGE)
  })
})
