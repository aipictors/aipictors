import { test, expect } from "bun:test"
import { isSensitiveKeyword } from "./is-sensitive-keyword"

test("センシティブなキーワードを正しく判定する", () => {
  // センシティブなワード
  expect(isSensitiveKeyword("おっぱい")).toBe(true)
  expect(isSensitiveKeyword("エロ")).toBe(true)
  expect(isSensitiveKeyword("r18")).toBe(true)
  expect(isSensitiveKeyword("18禁")).toBe(true)
  expect(isSensitiveKeyword("アダルト")).toBe(true)
  expect(isSensitiveKeyword("NSFW")).toBe(true)
  expect(isSensitiveKeyword("porn")).toBe(true)
  expect(isSensitiveKeyword("nude")).toBe(true)
  expect(isSensitiveKeyword("hentai")).toBe(true)
  expect(isSensitiveKeyword("sex")).toBe(true)
  expect(isSensitiveKeyword("裸")).toBe(true)
  expect(isSensitiveKeyword("セックス")).toBe(true)
  expect(isSensitiveKeyword("巨乳")).toBe(true)
  expect(isSensitiveKeyword("AV")).toBe(true)
  expect(isSensitiveKeyword("ロリコン")).toBe(true)
})

test("通常のキーワードはセンシティブではないと判定する", () => {
  // 通常のワード
  expect(isSensitiveKeyword("イラスト")).toBe(false)
  expect(isSensitiveKeyword("アニメ")).toBe(false)
  expect(isSensitiveKeyword("ゲーム")).toBe(false)
  expect(isSensitiveKeyword("漫画")).toBe(false)
  expect(isSensitiveKeyword("art")).toBe(false)
  expect(isSensitiveKeyword("drawing")).toBe(false)
  expect(isSensitiveKeyword("painting")).toBe(false)
  expect(isSensitiveKeyword("digital")).toBe(false)
  expect(isSensitiveKeyword("fantasy")).toBe(false)
  expect(isSensitiveKeyword("character")).toBe(false)
})

test("大文字小文字の違いは関係なく判定する", () => {
  expect(isSensitiveKeyword("NSFW")).toBe(true)
  expect(isSensitiveKeyword("nsfw")).toBe(true)
  expect(isSensitiveKeyword("Nsfw")).toBe(true)
  expect(isSensitiveKeyword("R18")).toBe(true)
  expect(isSensitiveKeyword("r18")).toBe(true)
  expect(isSensitiveKeyword("Porn")).toBe(true)
  expect(isSensitiveKeyword("PORN")).toBe(true)
})

test("空文字や空白文字はセンシティブではないと判定する", () => {
  expect(isSensitiveKeyword("")).toBe(false)
  expect(isSensitiveKeyword(" ")).toBe(false)
  expect(isSensitiveKeyword("  ")).toBe(false)
  expect(isSensitiveKeyword("\t")).toBe(false)
  expect(isSensitiveKeyword("\n")).toBe(false)
})

test("スペースを含む文字列では一部がマッチしても判定する", () => {
  expect(isSensitiveKeyword("美少女 おっぱい")).toBe(true)
  expect(isSensitiveKeyword("anime porn")).toBe(true)
  expect(isSensitiveKeyword("cute r18")).toBe(true)
})
