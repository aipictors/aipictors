import { describe, expect, test } from "bun:test"
import {
  toCreateFanzaUrl,
  toUpdateFanzaUrl,
} from "~/routes/($lang)._main.new.image/utils/fanza-url-input"

describe("FANZA の販売ページの URL", () => {
  test("投稿では R18 の作品で入力があるときだけ送る", () => {
    const url = "https://www.dmm.co.jp/dc/doujin/-/detail/=/cid=d_1/"
    expect(toCreateFanzaUrl(` ${url} `, "R18")).toBe(url)
    expect(toCreateFanzaUrl(url, "R18G")).toBe(url)
    expect(toCreateFanzaUrl(url, "G")).toBeUndefined()
    expect(toCreateFanzaUrl(url, "R15")).toBeUndefined()
    expect(toCreateFanzaUrl("  ", "R18")).toBeUndefined()
    expect(toCreateFanzaUrl(undefined, "R18")).toBeUndefined()
  })

  test("編集では読めていない値は送らず、空文字は消すために送る", () => {
    expect(toUpdateFanzaUrl(undefined)).toBeUndefined()
    expect(toUpdateFanzaUrl(null)).toBeUndefined()
    expect(toUpdateFanzaUrl(" ")).toBe("")
    expect(toUpdateFanzaUrl(" https://www.dmm.co.jp/x ")).toBe(
      "https://www.dmm.co.jp/x",
    )
  })
})
