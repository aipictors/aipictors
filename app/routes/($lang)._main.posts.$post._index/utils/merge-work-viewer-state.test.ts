import { expect, test } from "bun:test"
import { mergeWorkViewerState } from "./merge-work-viewer-state"

const work = {
  id: "1",
  title: "作品",
  isLiked: false,
  isBookmarked: false,
  isMyRecommended: false,
  user: { id: "2", name: "作者", isFollowee: false },
}

test("閲覧者の状態だけを重ね、作品の内容は変えない", () => {
  const merged = mergeWorkViewerState(work, {
    isLiked: true,
    isBookmarked: true,
    isMyRecommended: false,
    user: { id: "2", isFollowee: true },
  })
  expect(merged.title).toBe("作品")
  expect(merged.isLiked).toBe(true)
  expect(merged.isBookmarked).toBe(true)
  expect(merged.user).toEqual({ id: "2", name: "作者", isFollowee: true })
})

test("状態が届くまでと作品がないときはそのまま返す", () => {
  expect(mergeWorkViewerState(work, undefined)).toBe(work)
  expect(mergeWorkViewerState(null, null)).toBeNull()
})
