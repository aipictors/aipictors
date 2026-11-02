import { describe, expect, test } from "bun:test"
import { isR18Path, toR18Path } from "~/utils/content-mode"

describe("toR18Path", () => {
  test("一覧は /r のページへ", () => {
    expect(toR18Path("/rankings")).toBe("/r/rankings")
    expect(toR18Path("/tags/猫", "?page=2")).toBe("/r/tags/猫?page=2")
    expect(toR18Path("/users/foo/posts")).toBe("/r/users/foo/posts")
    expect(toR18Path("/posts/2d")).toBe("/r/posts/2d")
    expect(toR18Path("/en/themes")).toBe("/en/r/themes")
  })

  test("トップ系は /r のタブへ", () => {
    expect(toR18Path("/")).toBe("/r?tab=new")
    expect(toR18Path("/home")).toBe("/r?tab=home")
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
