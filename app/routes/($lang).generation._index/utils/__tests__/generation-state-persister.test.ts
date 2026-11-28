import { expect, test } from "bun:test"
import {
  createMemoryGenerationImageStore,
  type GenerationImageStore,
} from "../generation-image-store"
import {
  createGenerationStatePersister,
  hasInlineLargeFields,
  LARGE_FIELD_REFS_KEY,
  pickRestorableImages,
  takeLargeFieldRefs,
} from "../generation-state-persister"
import { GENERATION_STATE_STORAGE_KEY } from "../persist-generation-snapshot"
import { restoreGenerationSnapshot } from "../restore-generation-snapshot"

const bigImage = `data:image/png;base64,${"A".repeat(300_000)}`
const otherImage = `data:image/png;base64,${"B".repeat(300_000)}`

const snapshot = (context: Record<string, unknown>) => ({
  status: "active",
  value: "PROMPT_VIEW",
  context: {
    promptText: "1girl",
    i2iImageBase64: "",
    controlNetImageBase64: "",
    controlNetMaskImageBase64: "",
    previewImageURL: null,
    viewTaskIds: ["a"],
    ...context,
  },
})

/** setItem で書いた内容を覚えるだけの localStorage */
const createStorage = (options?: { quota?: number }) => {
  const items = new Map<string, string>()
  return {
    items,
    stored: () => {
      const text = items.get(GENERATION_STATE_STORAGE_KEY)
      return text === undefined ? null : JSON.parse(text)
    },
    storage: {
      setItem(key: string, value: string) {
        if (options?.quota !== undefined && value.length > options.quota) {
          throw new DOMException("quota", "QuotaExceededError")
        }
        items.set(key, value)
      },
      removeItem(key: string) {
        items.delete(key)
      },
    },
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

test("画像は IndexedDB に置き、localStorage には小さい設定とキーだけを置く", async () => {
  const { storage, stored } = createStorage()
  const { store, values } = createMemoryGenerationImageStore()
  const persister = createGenerationStatePersister({ storage, store })

  expect(
    persister.persist(
      snapshot({ i2iImageBase64: bigImage, controlNetImageBase64: otherImage }),
    ),
  ).toBe("full")
  await flush()

  const saved = stored()
  expect(saved.context.i2iImageBase64).toBe("")
  expect(saved.context.controlNetImageBase64).toBe("")
  expect(saved.context.promptText).toBe("1girl")
  expect(saved.context.viewTaskIds).toEqual(["a"])
  const refs = saved[LARGE_FIELD_REFS_KEY]
  expect(values.get(refs.i2iImageBase64)).toBe(bigImage)
  expect(values.get(refs.controlNetImageBase64)).toBe(otherImage)
  expect(JSON.stringify(saved).length).toBeLessThan(10_000)
})

test("画像が変わらなければ書き直さず、変われば書き直して古い画像を消す", async () => {
  const { storage, stored } = createStorage()
  const { store, values } = createMemoryGenerationImageStore()
  let putCount = 0
  const countingStore: GenerationImageStore = {
    ...store,
    put: (key, value) => {
      putCount++
      return store.put(key, value)
    },
  }
  const persister = createGenerationStatePersister({
    storage,
    store: countingStore,
  })

  persister.persist(snapshot({ i2iImageBase64: bigImage }))
  persister.persist(snapshot({ i2iImageBase64: bigImage, promptText: "cat" }))
  await flush()
  expect(putCount).toBe(1)
  const firstRef = stored()[LARGE_FIELD_REFS_KEY].i2iImageBase64

  persister.persist(snapshot({ i2iImageBase64: otherImage }))
  await flush()
  const secondRef = stored()[LARGE_FIELD_REFS_KEY].i2iImageBase64
  expect(secondRef).not.toBe(firstRef)
  expect(values.has(firstRef)).toBe(false)
  expect(values.get(secondRef)).toBe(otherImage)

  // 画像を外したら IndexedDB からも消す
  persister.persist(snapshot({ i2iImageBase64: "" }))
  await flush()
  expect(stored()[LARGE_FIELD_REFS_KEY]).toEqual({})
  expect(values.size).toBe(0)
})

test("以前の保存データ（画像がそのまま入っている）を移して、読み込み直すと画像が戻る", async () => {
  const legacy = JSON.stringify(snapshot({ i2iImageBase64: bigImage }))
  const { storage, items } = createStorage()
  items.set(GENERATION_STATE_STORAGE_KEY, legacy)
  const { store } = createMemoryGenerationImageStore()

  // 読み込み（画像はそのまま入っている）→ 移行の保存
  const restored = restoreGenerationSnapshot(legacy, ["PROMPT_VIEW"], {
    keepLargeFields: true,
  })
  expect(takeLargeFieldRefs(restored)).toEqual({})
  expect(hasInlineLargeFields(restored)).toBe(true)
  createGenerationStatePersister({ storage, store }).persist(restored)
  await flush()
  const rewritten = items.get(GENERATION_STATE_STORAGE_KEY) ?? ""
  expect(rewritten.length).toBeLessThan(10_000)

  // 読み込み直し: 設定はすぐ、画像は IndexedDB から後で戻る
  const next = restoreGenerationSnapshot(rewritten, ["PROMPT_VIEW"], {
    keepLargeFields: true,
  })
  const refs = takeLargeFieldRefs(next)
  expect(next[LARGE_FIELD_REFS_KEY]).toBeUndefined()
  expect(next.context.promptText).toBe("1girl")
  expect(next.context.i2iImageBase64).toBe("")
  const persister = createGenerationStatePersister({
    storage,
    store,
    pendingRefs: refs,
  })
  const loaded = await persister.load()
  expect(loaded).toEqual({ i2iImageBase64: bigImage })
})

test("画像の読み込み中に保存が走っても、空のままならキーを残す", async () => {
  const { storage, stored } = createStorage()
  const { store } = createMemoryGenerationImageStore()
  await store.put("generation.state:i2iImageBase64:1-a", bigImage)
  const persister = createGenerationStatePersister({
    storage,
    store,
    pendingRefs: { i2iImageBase64: "generation.state:i2iImageBase64:1-a" },
  })

  persister.persist(snapshot({ promptText: "dog" }))
  expect(stored()[LARGE_FIELD_REFS_KEY]).toEqual({
    i2iImageBase64: "generation.state:i2iImageBase64:1-a",
  })
  expect(stored().context.promptText).toBe("dog")
})

test("読み込みの間にユーザーが入れた画像は上書きしない", async () => {
  const { storage, stored } = createStorage()
  const { store, values } = createMemoryGenerationImageStore()
  await store.put("generation.state:i2iImageBase64:1-a", bigImage)
  const persister = createGenerationStatePersister({
    storage,
    store,
    pendingRefs: { i2iImageBase64: "generation.state:i2iImageBase64:1-a" },
  })

  // 読み込みが終わる前にユーザーが別の画像を入れた
  persister.persist(snapshot({ i2iImageBase64: otherImage }))
  const loaded = await persister.load()
  expect(loaded).toEqual({})
  expect(
    pickRestorableImages(
      { i2iImageBase64: otherImage, controlNetImageBase64: "" },
      { i2iImageBase64: bigImage, controlNetImageBase64: bigImage },
    ),
  ).toEqual({ controlNetImageBase64: bigImage })
  await flush()
  const ref = stored()[LARGE_FIELD_REFS_KEY].i2iImageBase64
  expect(values.get(ref)).toBe(otherImage)
})

test("読み込んだ画像を入れても同じ画像を書き直さない", async () => {
  const { storage, stored } = createStorage()
  const { store } = createMemoryGenerationImageStore()
  const ref = "generation.state:i2iImageBase64:1-a"
  await store.put(ref, bigImage)
  let putCount = 0
  const persister = createGenerationStatePersister({
    storage,
    store: {
      ...store,
      put: (key, value) => {
        putCount++
        return store.put(key, value)
      },
    },
    pendingRefs: { i2iImageBase64: ref },
  })

  const loaded = await persister.load()
  persister.markLoaded(loaded)
  persister.persist(snapshot({ i2iImageBase64: bigImage }))
  await flush()
  expect(putCount).toBe(0)
  expect(stored()[LARGE_FIELD_REFS_KEY].i2iImageBase64).toBe(ref)
})

test("消えていた画像のキーは残さない", async () => {
  const { storage, stored } = createStorage()
  const { store } = createMemoryGenerationImageStore()
  const persister = createGenerationStatePersister({
    storage,
    store,
    pendingRefs: { i2iImageBase64: "generation.state:i2iImageBase64:1-a" },
  })
  expect(await persister.load()).toEqual({})
  persister.persist(snapshot({}))
  expect(stored()[LARGE_FIELD_REFS_KEY]).toEqual({})
})

test("IndexedDB が無ければ今までどおり localStorage に保存する（入らなければ画像を外す）", () => {
  const { storage, stored } = createStorage({ quota: 100_000 })
  const persister = createGenerationStatePersister({ storage, store: null })
  expect(persister.persist(snapshot({ i2iImageBase64: bigImage }))).toBe("slim")
  expect(stored().context.i2iImageBase64).toBe("")
  expect(stored().context.promptText).toBe("1girl")
  expect(persister.persist(snapshot({ i2iImageBase64: "data:small" }))).toBe(
    "full",
  )
  expect(stored().context.i2iImageBase64).toBe("data:small")
})

test("IndexedDB に書けなければ localStorage だけの保存に切り替え、生成は止めない", async () => {
  const { storage, stored } = createStorage()
  const { store } = createMemoryGenerationImageStore()
  const persister = createGenerationStatePersister({
    storage,
    store: {
      ...store,
      put: async () => {
        throw new DOMException("quota", "QuotaExceededError")
      },
    },
  })

  expect(() =>
    persister.persist(snapshot({ i2iImageBase64: "data:small" })),
  ).not.toThrow()
  await flush()
  expect(persister.isUsingStore()).toBe(false)
  // 画像も含めて localStorage に入れ直す
  expect(stored().context.i2iImageBase64).toBe("data:small")
  expect(stored()[LARGE_FIELD_REFS_KEY]).toBeUndefined()
})

test("IndexedDB から読めなくても例外を投げない", async () => {
  const { storage } = createStorage()
  const { store } = createMemoryGenerationImageStore()
  const persister = createGenerationStatePersister({
    storage,
    store: {
      ...store,
      get: async () => {
        throw new Error("broken")
      },
    },
    pendingRefs: { i2iImageBase64: "generation.state:i2iImageBase64:1-a" },
  })
  expect(await persister.load()).toEqual({})
})

test("使っていない古い画像だけを消す", async () => {
  const { storage } = createStorage()
  const { store, values } = createMemoryGenerationImageStore()
  const day = 24 * 60 * 60 * 1000
  const now = 10 * day
  const oldRef = `generation.state:i2iImageBase64:${(now - 2 * day).toString(36)}-a`
  const recentRef = `generation.state:i2iImageBase64:${(now - 1000).toString(36)}-b`
  const usedRef = `generation.state:controlNetImageBase64:${(now - 3 * day).toString(36)}-c`
  await store.put(oldRef, bigImage)
  await store.put(recentRef, bigImage)
  await store.put(usedRef, bigImage)
  await store.put("other-key", "x")
  const persister = createGenerationStatePersister({
    storage,
    store,
    pendingRefs: { controlNetImageBase64: usedRef },
    now: () => now,
  })
  await persister.prune()
  expect([...values.keys()].sort()).toEqual(
    [recentRef, usedRef, "other-key"].sort(),
  )
})

test("キーでないものは保存データから取り出さない", () => {
  const data = {
    value: "PROMPT_VIEW",
    context: {},
    [LARGE_FIELD_REFS_KEY]: { i2iImageBase64: "x", controlNetImageBase64: 1 },
  }
  expect(takeLargeFieldRefs(data)).toEqual({})
  expect(LARGE_FIELD_REFS_KEY in data).toBe(false)
})
