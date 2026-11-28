import { expect, test } from "bun:test"
import {
  GENERATION_STATE_STORAGE_KEY,
  MAX_GENERATION_STATE_LENGTH,
  persistGenerationSnapshot,
  slimGenerationSnapshot,
} from "../persist-generation-snapshot"
import { restoreGenerationSnapshot } from "../restore-generation-snapshot"

const bigImage = `data:image/png;base64,${"A".repeat(300_000)}`

const snapshot = (i2iImageBase64: string) => ({
  status: "active",
  value: "PROMPT_VIEW",
  historyValue: {},
  context: {
    promptText: "1girl",
    i2iImageBase64,
    controlNetImageBase64: bigImage,
    viewTaskIds: ["a", "b"],
    seed: 1,
  },
  children: {},
})

/** 上限を超えると QuotaExceededError を投げる localStorage の代わり */
function createStorage(quota: number) {
  const items = new Map<string, string>()
  const used = () =>
    [...items.values()].reduce((sum, value) => sum + value.length, 0)
  return {
    items,
    setItem(key: string, value: string) {
      const current = items.get(key)?.length ?? 0
      if (used() - current + value.length > quota) {
        throw new DOMException("quota", "QuotaExceededError")
      }
      items.set(key, value)
    },
    removeItem(key: string) {
      items.delete(key)
    },
  }
}

test("容量が足りれば全部保存する", () => {
  const storage = createStorage(10_000_000)
  expect(persistGenerationSnapshot(storage, snapshot(""))).toBe("full")
  const saved = JSON.parse(
    storage.items.get(GENERATION_STATE_STORAGE_KEY) ?? "",
  )
  expect(saved.context.controlNetImageBase64).toBe(bigImage)
})

test("容量超えでは画像などの大きい項目を外して保存し直す", () => {
  const storage = createStorage(100_000)
  expect(persistGenerationSnapshot(storage, snapshot(bigImage))).toBe("slim")
  const saved = JSON.parse(
    storage.items.get(GENERATION_STATE_STORAGE_KEY) ?? "",
  )
  expect(saved.context.promptText).toBe("1girl")
  expect(saved.context.seed).toBe(1)
  expect(saved.context.i2iImageBase64).toBe("")
  expect(saved.context.controlNetImageBase64).toBe("")
  expect(saved.context.viewTaskIds).toEqual([])
})

test("ほかの保存で埋まっていても例外を投げず、前回の大きい保存を消して入れ直す", () => {
  const storage = createStorage(400_000)
  storage.items.set(GENERATION_STATE_STORAGE_KEY, "x".repeat(350_000))
  storage.items.set("other", "y".repeat(40_000))
  expect(persistGenerationSnapshot(storage, snapshot(bigImage))).toBe("slim")
})

test("どうしても入らなければ保存を諦める（例外は投げない）", () => {
  const storage = createStorage(10)
  expect(() => persistGenerationSnapshot(storage, snapshot(""))).not.toThrow()
  expect(persistGenerationSnapshot(storage, snapshot(""))).toBeNull()
})

test("上限より大きい状態は容量があっても大きい項目を外す", () => {
  const storage = createStorage(100_000_000)
  const huge = `data:image/png;base64,${"A".repeat(MAX_GENERATION_STATE_LENGTH)}`
  expect(persistGenerationSnapshot(storage, snapshot(huge))).toBe("slim")
})

test("読み込み時、大きすぎる古い保存データは画像を捨てて設定だけ戻す", () => {
  const huge = `data:image/png;base64,${"A".repeat(MAX_GENERATION_STATE_LENGTH)}`
  const restored = restoreGenerationSnapshot(JSON.stringify(snapshot(huge)), [
    "PROMPT_VIEW",
  ])
  expect(restored.context.promptText).toBe("1girl")
  expect(restored.context.i2iImageBase64).toBe("")
  expect(restored.context.controlNetImageBase64).toBe("")
})

test("小さい保存データは画像もそのまま戻す", () => {
  const restored = restoreGenerationSnapshot(
    JSON.stringify(snapshot("data:image/png;base64,AAAA")),
    ["PROMPT_VIEW"],
  )
  expect(restored.context.i2iImageBase64).toBe("data:image/png;base64,AAAA")
})

test("slimGenerationSnapshot は context が無ければそのまま返す", () => {
  expect(slimGenerationSnapshot(null)).toBeNull()
  expect(slimGenerationSnapshot({ value: "A" })).toEqual({ value: "A" })
})
