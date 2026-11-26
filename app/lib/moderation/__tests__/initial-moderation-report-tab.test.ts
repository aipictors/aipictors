import { expect, test } from "bun:test"
import { initialModerationReportTab } from "~/lib/moderation/initial-moderation-report-tab"

test("対応が必要なものがあればそのタブを開く", () => {
  expect(initialModerationReportTab({ ACTION: 1, INFO: 3, DONE: 0 })).toBe(
    "ACTION",
  )
})

test("対応が必要なものが無く、お知らせのみがあればそちらを開く", () => {
  expect(initialModerationReportTab({ ACTION: 0, INFO: 1, DONE: 2 })).toBe(
    "INFO",
  )
})

test("何も無ければ対応が必要のタブを開く", () => {
  expect(initialModerationReportTab({ ACTION: 0, INFO: 0, DONE: 0 })).toBe(
    "ACTION",
  )
})
