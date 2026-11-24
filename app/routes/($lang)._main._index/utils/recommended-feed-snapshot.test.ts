import { expect, test } from "bun:test"
import {
  pickRecommendedFeedSnapshot,
  RECOMMENDED_SNAPSHOT_MAX_AGE_MS,
} from "./recommended-feed-snapshot"

const now = 1_800_000_000_000
const snapshot = {
  userId: "u1",
  ratingsKey: "G,R15",
  savedAt: now - 60_000,
  works: [{ id: "1" }, { id: "2" }],
}

test("同じ人・同じ年齢制限で新しければ前回の一覧を使う", () => {
  expect(
    pickRecommendedFeedSnapshot(snapshot, {
      userId: "u1",
      ratingsKey: "G,R15",
      now,
    }),
  ).toEqual(snapshot.works)
})

test("別の人・別の年齢制限・古い・空・なしは使わない", () => {
  const props = { userId: "u1", ratingsKey: "G,R15", now }
  expect(
    pickRecommendedFeedSnapshot(snapshot, { ...props, userId: "u2" }),
  ).toBeNull()
  expect(
    pickRecommendedFeedSnapshot(snapshot, { ...props, ratingsKey: "G" }),
  ).toBeNull()
  expect(
    pickRecommendedFeedSnapshot(
      { ...snapshot, savedAt: now - RECOMMENDED_SNAPSHOT_MAX_AGE_MS - 1 },
      props,
    ),
  ).toBeNull()
  expect(
    pickRecommendedFeedSnapshot({ ...snapshot, savedAt: now + 60_000 }, props),
  ).toBeNull()
  expect(
    pickRecommendedFeedSnapshot({ ...snapshot, works: [] }, props),
  ).toBeNull()
  expect(pickRecommendedFeedSnapshot(null, props)).toBeNull()
})
