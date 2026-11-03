import { afterEach, expect, spyOn, test } from "bun:test"
import {
  buildHomeEventPreviews,
  isHomePreviewTargetStatus,
  normalizeOfficialHomePreviewEvent,
  normalizeUserHomePreviewEvent,
  shuffleArray,
} from "./home-event-previews"

const official = {
  id: "1",
  slug: "official",
  title: "公式",
  thumbnailImageUrl: "https://example.com/official.png",
  status: "ONGOING",
  startAt: 1,
  endAt: 2,
  tag: "お題",
  worksCount: 3,
}

const user = {
  id: "2",
  slug: "user",
  title: "ユーザー",
  thumbnailImageUrl: "",
  headerImageUrl: "https://example.com/header.png",
  status: "UPCOMING",
  startAt: 3,
  endAt: 4,
  mainTag: "メイン",
  tags: ["サブ", ""],
  rankingEnabled: true,
  entryCount: 5,
  participantCount: 6,
  userIconUrl: null,
  userName: "投稿者",
}

afterEach(() => {
  spyOn(Math, "random").mockRestore()
})

test("公式イベントは Aipictors の名前で、タグがなければ空にする", () => {
  const preview = normalizeOfficialHomePreviewEvent(official)
  expect(preview.isOfficial).toBe(true)
  expect(preview.userName).toBe("Aipictors")
  expect(preview.entryCount).toBe(3)
  expect(preview.tags).toEqual(["お題"])

  const noTag = normalizeOfficialHomePreviewEvent({
    ...official,
    tag: null,
    worksCount: null,
  })
  expect(noTag.tags).toEqual([])
  expect(noTag.entryCount).toBe(0)
})

test("ユーザーイベントはサムネイル、ヘッダー、既定の画像の順に使い、空のタグを除く", () => {
  const preview = normalizeUserHomePreviewEvent(user)
  expect(preview.isOfficial).toBe(false)
  expect(preview.thumbnailImageUrl).toBe("https://example.com/header.png")
  expect(preview.tags).toEqual(["メイン", "サブ"])

  expect(
    normalizeUserHomePreviewEvent({
      ...user,
      headerImageUrl: null,
      tags: null,
    }),
  ).toMatchObject({
    thumbnailImageUrl: "/images/opepnepe.png",
    tags: ["メイン"],
  })
})

test("開催中と開催予定だけを出す", () => {
  expect(isHomePreviewTargetStatus("ONGOING")).toBe(true)
  expect(isHomePreviewTargetStatus("UPCOMING")).toBe(true)
  expect(isHomePreviewTargetStatus("ENDED")).toBe(false)

  const previews = buildHomeEventPreviews(
    [official, { ...official, id: "ended", status: "ENDED" }],
    [user, { ...user, id: "ended-user", status: "ENDED" }],
  )
  expect(previews.map((event) => event.id).sort()).toEqual(["1", "2"])
})

test("シャッフルは元の配列を変えず、要素を失わない", () => {
  spyOn(Math, "random").mockReturnValue(0)
  const items = [1, 2, 3, 4]
  expect(shuffleArray(items)).toEqual([2, 3, 4, 1])
  expect(items).toEqual([1, 2, 3, 4])
})
