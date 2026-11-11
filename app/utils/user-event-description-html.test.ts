import { describe, expect, test } from "bun:test"
import { toSafeUserEventDescriptionHtml } from "~/utils/user-event-description-html"

describe("toSafeUserEventDescriptionHtml", () => {
  test("タグは文字として残さず、スクリプトや属性は動かない", () => {
    const html = toSafeUserEventDescriptionHtml(
      '<img src=x onerror="alert(1)">猫<script>alert(2)</script>',
    )
    expect(html).not.toContain("<img")
    expect(html).not.toContain("<script")
    expect(html).toBe("猫alert(2)")
  })

  test("改行・<br>・</p> は改行に、< や & は文字のまま", () => {
    expect(toSafeUserEventDescriptionHtml("1行目\n2行目")).toBe("1行目<br>2行目")
    expect(toSafeUserEventDescriptionHtml("<p>a</p><p>b</p>")).toBe("a<br>b<br>")
    expect(toSafeUserEventDescriptionHtml("1 < 2 & 3")).toBe("1 &lt; 2 &amp; 3")
    expect(toSafeUserEventDescriptionHtml(null)).toBe("")
  })
})
