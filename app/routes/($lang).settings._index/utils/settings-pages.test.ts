import { describe, expect, test } from "bun:test"
import {
  findSettingsPage,
  findSettingsPageHref,
} from "~/routes/($lang).settings._index/utils/settings-pages"

describe("設定のページの判定", () => {
  test("下の階層は親の項目になる", () => {
    expect(findSettingsPageHref("/settings/account/login")).toBe(
      "/settings/account",
    )
    expect(findSettingsPageHref("/settings/muted/users")).toBe(
      "/settings/muted/users",
    )
  })

  test("言語つきの URL と末尾のスラッシュ", () => {
    expect(findSettingsPageHref("/en/settings/points/")).toBe(
      "/settings/points",
    )
  })

  test("/settings は通知、Push 通知は通知の項目を光らせる", () => {
    expect(findSettingsPageHref("/settings")).toBe("/settings/notification")
    expect(findSettingsPageHref("/settings/push-notification")).toBe(
      "/settings/notification",
    )
    expect(findSettingsPage("/settings/push-notification")?.ja).toBe("Push通知")
  })

  test("似た名前の別ページに当たらない", () => {
    expect(findSettingsPageHref("/settings/profile-x")).toBeNull()
  })
})
