import { describe, expect, test } from "bun:test"
import { summarizeNewcomerReactions } from "./home-newcomer-reactions-card"

const DAY = 24 * 60 * 60
const now = 1_800_000_000

const work = (
  id: string,
  props: Partial<{
    isFirstPost: boolean
    likesCount: number
    commentsCount: number
    createdAt: number
  }> = {},
) => ({
  id,
  title: `作品${id}`,
  smallThumbnailImageURL: "",
  isFirstPost: props.isFirstPost ?? false,
  likesCount: props.likesCount ?? 0,
  commentsCount: props.commentsCount ?? 0,
  createdAt: props.createdAt ?? now - DAY,
})

describe("summarizeNewcomerReactions", () => {
  test("初投稿から 14 日以内なら、この 14 日の作品の反応を合計する", () => {
    const summary = summarizeNewcomerReactions(
      [
        work("3", { likesCount: 4, commentsCount: 1 }),
        work("2", { likesCount: 2, createdAt: now - 20 * DAY }),
        work("1", { isFirstPost: true, likesCount: 10, commentsCount: 2, createdAt: now - 3 * DAY }),
      ],
      now,
    )
    expect(summary).toMatchObject({ likes: 14, comments: 3, total: 17, otherWorksCount: 1 })
    expect(summary?.firstPost.id).toBe("1")
  })

  test("初投稿が 14 日より前・見つからないときは出さない", () => {
    expect(
      summarizeNewcomerReactions([work("1", { isFirstPost: true, createdAt: now - 15 * DAY })], now),
    ).toBeNull()
    expect(summarizeNewcomerReactions([work("1")], now)).toBeNull()
  })
})
