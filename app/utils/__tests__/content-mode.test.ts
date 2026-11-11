import { describe, expect, test } from "bun:test"
import {
  isR18Path,
  toR18FallbackPath,
  toR18Path,
} from "~/utils/content-mode"

describe("toR18Path", () => {
  test("一覧は /r のページへ", () => {
    expect(toR18Path("/rankings")).toBe("/r/rankings")
    expect(toR18Path("/popular", "?date=2026-11-11")).toBe(
      "/r/popular?date=2026-11-11",
    )
    expect(toR18Path("/tags/猫", "?page=2")).toBe("/r/tags/猫?page=2")
    expect(toR18Path("/users/foo/posts")).toBe("/r/users/foo/posts")
    expect(toR18Path("/posts/2d")).toBe("/r/posts/2d")
    expect(toR18Path("/en/themes")).toBe("/en/r/themes")
  })

  test("トップ系は /r のタブへ", () => {
    expect(toR18Path("/")).toBe("/r?tab=new")
    expect(toR18Path("/home")).toBe("/r/home")
    expect(toR18Path("/archive", "?year=2024")).toBe("/r/archive?year=2024")
    expect(toR18Path("/follow-user-works")).toBe("/r?tab=follow-user")
    expect(toR18Path("/en")).toBe("/en/r?tab=new")
  })

  test("/r のページがないものはそのまま（モードは覚えたまま）", () => {
    expect(toR18Path("/generation")).toBeNull()
    expect(toR18Path("/settings/points")).toBeNull()
    expect(toR18Path("/plus")).toBeNull()
    expect(toR18Path("/help")).toBeNull()
  })

  test("作品ページは置き換えない（年齢区分に合わせてサーバーが振り分ける）", () => {
    expect(toR18Path("/posts/123")).toBeNull()
  })

  test("すでに /r なら置き換えない", () => {
    expect(toR18Path("/r/rankings")).toBeNull()
    expect(toR18Path("/r")).toBeNull()
    expect(toR18Path("/en/r/tags/猫")).toBeNull()
  })

  test("/r で始まる別のパスを R18 とみなさない", () => {
    expect(isR18Path("/rankings")).toBe(false)
    expect(isR18Path("/releases")).toBe(false)
    expect(isR18Path("/r")).toBe(true)
    expect(isR18Path("/en/r/posts/1")).toBe(true)
  })
})

describe("toR18FallbackPath", () => {
  test("R18 版のないページは /r を外す", () => {
    expect(toR18FallbackPath("/r/about")).toBe("/about")
    expect(toR18FallbackPath("/r/settings/points", "?a=1")).toBe(
      "/settings/points?a=1",
    )
    expect(toR18FallbackPath("/r/stickers")).toBe("/stickers")
    expect(toR18FallbackPath("/r/models")).toBe("/models")
  })

  test("/r のページがなければ、新しいページでも /r を外す", () => {
    expect(toR18FallbackPath("/r/generation")).toBe("/generation")
    expect(toR18FallbackPath("/r/new/image")).toBe("/new/image")
    expect(toR18FallbackPath("/r/posts/1/image/edit")).toBe(
      "/posts/1/image/edit",
    )
    expect(toR18FallbackPath("/en/r/about")).toBe("/en/about")
  })

  test("R18 ではトップのタブにあるものはタブへ", () => {
    expect(toR18FallbackPath("/r/follow-user-works")).toBe(
      "/r?tab=follow-user",
    )
    expect(toR18FallbackPath("/r/new-works", "?page=2")).toBe(
      "/r?page=2&tab=new",
    )
  })

  test("R18 のページはそのまま", () => {
    for (const path of [
      "/r",
      "/r/home",
      "/r/archive",
      "/r/search",
      "/r/tags",
      "/r/tags/猫",
      "/r/posts/3d",
      "/r/posts/123",
      "/r/users/foo",
      "/r/models/12",
      "/about",
    ]) {
      expect(toR18FallbackPath(path)).toBeNull()
    }
  })

  test("移動先を /r に戻さない（ループしない）", () => {
    for (const path of ["/stickers", "/about", "/settings", "/models", "/my"]) {
      expect(toR18Path(path)).toBeNull()
    }
  })
})
