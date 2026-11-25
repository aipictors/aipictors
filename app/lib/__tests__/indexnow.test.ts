import { expect, test } from "bun:test"
import { selectIndexNowUrls } from "~/lib/indexnow"

test("直近に公開された作品だけを送り、R18 は載せられる作品だけにする", () => {
  const now = 1_800_000_000
  const urls = selectIndexNowUrls(
    {
      general: [
        { id: "1", title: "猫", createdAt: now - 60 },
        { id: "2", title: "予約投稿", createdAt: now + 600 },
        { id: "3", title: "古い", createdAt: now - 3 * 60 * 60 },
      ],
      sensitive: [
        {
          id: "4",
          title: "熟女",
          createdAt: now - 60,
          rating: "R18",
          tagNames: ["熟女"],
        },
        {
          id: "5",
          title: "JK",
          createdAt: now - 60,
          rating: "R18",
          tagNames: [],
        },
        {
          id: "6",
          title: "猫",
          createdAt: now - 60,
          rating: "R18",
          tagNames: ["ロリ"],
        },
        {
          id: "7",
          title: "猫",
          createdAt: now - 60,
          rating: "R18G",
          tagNames: [],
        },
      ],
    },
    now,
  )
  expect(urls).toEqual([
    "https://www.aipictors.com/posts/1",
    "https://www.aipictors.com/r/posts/4",
  ])
})
