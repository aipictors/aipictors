import { expect, test } from "bun:test"
import {
  type PanelItem,
  toPanelItems,
  toRowHref,
} from "./home-notifications-panel-items"

const work = { id: "9", title: "題名" }
const user = { id: "2", name: "名前" }

test("通知の種類ごとに行の形へそろえ、新しい順に並べる", () => {
  const items = toPanelItems([
    {
      __typename: "LikedWorkNotificationNode",
      id: "a",
      createdAt: 1,
      work,
      user,
    },
    { __typename: "FollowNotificationNode", id: "b", createdAt: 3, user },
    {
      __typename: "WorkCommentNotificationNode",
      id: "c",
      createdAt: 2,
      work,
      user,
      message: "こんにちは",
      sticker: { imageUrl: "s.png" },
      myReplies: [],
    },
  ])
  expect(items.map((item) => [item.id, item.kind])).toEqual([
    ["b", "follow"],
    ["c", "comment"],
    ["a", "liked"],
  ])
  expect(items[1]).toMatchObject({
    workId: "9",
    message: "こんにちは",
    stickerUrl: "s.png",
    isNotReplied: true,
  })
})

test("返信済みのコメントは未返信にしない", () => {
  const [item] = toPanelItems([
    {
      __typename: "WorkCommentNotificationNode",
      id: "c",
      createdAt: 2,
      myReplies: [{ id: "r" }],
    },
  ])
  expect(item?.isNotReplied).toBe(false)
})

test("作品のない入賞はコインのお知らせ、返信だけ返信先を持つ", () => {
  const items = toPanelItems([
    { __typename: "WorkAwardNotificationNode", id: "coin", createdAt: 3 },
    {
      __typename: "WorkAwardNotificationNode",
      id: "award",
      createdAt: 2,
      work,
    },
    {
      __typename: "WorkCommentReplyNotificationNode",
      id: "reply",
      createdAt: 1,
      comment: { text: "親" },
    },
    {
      __typename: "WorkCommentNotificationNode",
      id: "comment",
      createdAt: 0,
      comment: { text: "無視" },
    },
  ])
  expect(items.map((item) => item.kind)).toEqual([
    "coin",
    "award",
    "reply",
    "comment",
  ])
  expect(items[2]?.parentComment).toEqual({ text: "親" })
  expect(items[3]?.parentComment).toBeNull()
})

test("表示できない通知を除く", () => {
  expect(
    toPanelItems([
      { __typename: "Unknown", id: "x", createdAt: 1 },
      { __typename: "LikedWorkNotificationNode", id: "y", createdAt: 1 },
      { __typename: "FollowNotificationNode", id: "z", createdAt: 1 },
    ]),
  ).toEqual([])
  expect(toPanelItems(null)).toEqual([])
  expect(toPanelItems(undefined)).toEqual([])
})

const item = (over: Partial<PanelItem>): PanelItem => ({
  id: "1",
  kind: "liked",
  createdAt: 0,
  workId: null,
  work: null,
  user: null,
  message: null,
  stickerUrl: null,
  isNotReplied: false,
  support: null,
  replyTargetCommentId: null,
  myReplies: [],
  parentComment: null,
  ...over,
})

test("行のリンク先", () => {
  expect(toRowHref(item({ kind: "follow", user }))).toBe("/users/2")
  expect(toRowHref(item({ kind: "follow" }))).toBeNull()
  expect(toRowHref(item({ kind: "coin", message: "🏅 実績" }))).toBe(
    "/achievements",
  )
  expect(toRowHref(item({ kind: "coin", message: "コイン" }))).toBeNull()
  expect(toRowHref(item({ work }))).toBe("/posts/9")
  expect(toRowHref(item({}))).toBeNull()
})
