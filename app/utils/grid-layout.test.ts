import { describe, expect, test } from "bun:test"
import { getGridLayout, parseGridLayout } from "~/utils/grid-layout"

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
