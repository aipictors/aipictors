import { describe, expect, test } from "bun:test"
import {
  getGridLayout,
  paddedRowClassNames,
  parseGridLayout,
  SQUARE_GRID_BREAKPOINTS,
} from "~/utils/grid-layout"

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"

// Request は cookie ヘッダーを落とすので、ヘッダーだけの形で渡す
const request = (userAgent: string, cookie?: string) =>
  ({
    headers: new Headers({
      "user-agent": userAgent,
      ...(cookie ? { cookie } : {}),
    }),
  }) as Request

describe("parseGridLayout", () => {
  test("選んだ並べ方を読む", () => {
    expect(parseGridLayout("a=1; aip_grid=justified")).toBe("justified")
    expect(parseGridLayout("aip_grid=square; b=2", "justified")).toBe("square")
  })

  test("選んでいなければ既定", () => {
    expect(parseGridLayout("")).toBe("square")
    expect(parseGridLayout(null, "justified")).toBe("justified")
    expect(parseGridLayout("aip_grid=other", "justified")).toBe("justified")
  })
})

describe("getGridLayout", () => {
  test("選んでいないスマホは石垣状、PC は正方形", () => {
    expect(getGridLayout(request(IPHONE))).toBe("justified")
    expect(getGridLayout(request(MAC))).toBe("square")
  })

  test("選んだ並べ方は端末に関係なく使う", () => {
    expect(getGridLayout(request(IPHONE, "aip_grid=square"))).toBe("square")
    expect(getGridLayout(request(MAC, "aip_grid=justified"))).toBe("justified")
  })
})

describe("paddedRowClassNames", () => {
  // 2 / sm:3 / md:4 / xl:5 / 2xl:6 列
  test("推薦 5 件 + 埋め草 5 件: どの列数でも行が埋まる", () => {
    const classes = paddedRowClassNames(5, 5, SQUARE_GRID_BREAKPOINTS)
    // 作品は隠さない
    for (let i = 0; i < 5; i++) expect(classes.item(i)).toBe("")
    // 2 列は 1 枚、3 列は 1 枚、4 列は 3 枚、5 列は 0 枚、6 列は 1 枚足す
    expect(classes.pad(0)).toBe("xl:max-2xl:hidden")
    expect(classes.pad(1)).toBe(
      "max-sm:hidden sm:max-md:hidden xl:max-2xl:hidden 2xl:hidden",
    )
    expect(classes.pad(2)).toBe(
      "max-sm:hidden sm:max-md:hidden xl:max-2xl:hidden 2xl:hidden",
    )
    expect(classes.pad(3)).toBe(
      "max-sm:hidden sm:max-md:hidden md:max-xl:hidden xl:max-2xl:hidden 2xl:hidden",
    )
  })

  test("埋め草が足りない幅は、最後の行の半端な作品を隠す", () => {
    const classes = paddedRowClassNames(7, 1, SQUARE_GRID_BREAKPOINTS)
    // 2・4 列は 1 枚で埋まる。3 列（2 枚要る）は 7 枚目、5 列（3 枚要る）は 6・7 枚目、6 列（5 枚要る）は 7 枚目を隠す
    expect(classes.item(6)).toBe(
      "sm:max-md:hidden xl:max-2xl:hidden 2xl:hidden",
    )
    expect(classes.item(5)).toBe("xl:max-2xl:hidden")
    expect(classes.item(0)).toBe("")
    expect(classes.pad(0)).toContain("xl:max-2xl:hidden")
    expect(classes.pad(0)).not.toContain("md:max-xl:hidden")
  })
})
