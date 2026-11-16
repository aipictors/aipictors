import { expect, test } from "bun:test"
import { isMobileTabBarHiddenPath } from "~/utils/mobile-tab-bar-hidden-path"

test("作品の編集ページでは下のタブを出さない（更新ボタンが隠れないように）", () => {
  expect(isMobileTabBarHiddenPath("/posts/123/image/edit")).toBe(true)
  expect(isMobileTabBarHiddenPath("/posts/123/animation/edit")).toBe(true)
  expect(isMobileTabBarHiddenPath("/posts/123/text/edit")).toBe(true)
  expect(isMobileTabBarHiddenPath("/posts/123/edit")).toBe(true)
})

test("投稿・設定などは出さず、作品ページや一覧では出す", () => {
  expect(isMobileTabBarHiddenPath("/new/image")).toBe(true)
  expect(isMobileTabBarHiddenPath("/settings")).toBe(true)
  expect(isMobileTabBarHiddenPath("/posts/123")).toBe(false)
  expect(isMobileTabBarHiddenPath("/posts/123/editor-notes")).toBe(false)
  expect(isMobileTabBarHiddenPath("/")).toBe(false)
  expect(isMobileTabBarHiddenPath("/newcomers")).toBe(false)
})
