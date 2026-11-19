import { describe, expect, test } from "bun:test"
import {
  GENERATION_PENDING_PROMPT_TTL_MS,
  isAdvancedEntryRequested,
  parseGenerationPendingPrompt,
} from "./generation-simple-entry"
import { GENERATION_SIMPLE_ENTRY_EXAMPLES } from "./generation-simple-entry-examples"

describe("isAdvancedEntryRequested", () => {
  test("パラメータがなければかんたん入口を出してよい", () => {
    expect(isAdvancedEntryRequested("")).toBe(false)
    expect(isAdvancedEntryRequested("?utm_source=x")).toBe(false)
    expect(isAdvancedEntryRequested("?mode=simple")).toBe(false)
  })

  test("?mode=advanced は詳細画面", () => {
    expect(isAdvancedEntryRequested("?mode=advanced")).toBe(true)
  })

  test("プロンプトやモデルを渡す既存のリンクは詳細画面", () => {
    expect(isAdvancedEntryRequested("?prompts=cat")).toBe(true)
    expect(isAdvancedEntryRequested("?work=123")).toBe(true)
    expect(isAdvancedEntryRequested("?ref=abc")).toBe(true)
    expect(isAdvancedEntryRequested("?model=1")).toBe(true)
    expect(isAdvancedEntryRequested("?userModel=9")).toBe(true)
    expect(isAdvancedEntryRequested("?lora=foo")).toBe(true)
    expect(isAdvancedEntryRequested("?result=ok")).toBe(true)
  })
})

describe("parseGenerationPendingPrompt", () => {
  const now = 1_800_000_000_000

  test("保存した形をそのまま読む", () => {
    const value = JSON.stringify({ prompt: "cat", createdAt: now - 1000 })
    expect(parseGenerationPendingPrompt(value, now)).toEqual({
      prompt: "cat",
      createdAt: now - 1000,
    })
  })

  test("古いもの・空・壊れたものは使わない", () => {
    const old = JSON.stringify({
      prompt: "cat",
      createdAt: now - GENERATION_PENDING_PROMPT_TTL_MS - 1,
    })
    expect(parseGenerationPendingPrompt(old, now)).toBeNull()
    expect(
      parseGenerationPendingPrompt(
        JSON.stringify({ prompt: "  ", createdAt: now }),
        now,
      ),
    ).toBeNull()
    expect(parseGenerationPendingPrompt("{", now)).toBeNull()
    expect(parseGenerationPendingPrompt(null, now)).toBeNull()
    expect(parseGenerationPendingPrompt('"cat"', now)).toBeNull()
  })
})

describe("GENERATION_SIMPLE_ENTRY_EXAMPLES", () => {
  test("作例は 6〜8 枚で、ID・画像・プロンプトがそろっている", () => {
    expect(GENERATION_SIMPLE_ENTRY_EXAMPLES.length).toBeGreaterThanOrEqual(6)
    expect(GENERATION_SIMPLE_ENTRY_EXAMPLES.length).toBeLessThanOrEqual(8)
    const ids = new Set(
      GENERATION_SIMPLE_ENTRY_EXAMPLES.map((item) => item.workId),
    )
    expect(ids.size).toBe(GENERATION_SIMPLE_ENTRY_EXAMPLES.length)
    for (const item of GENERATION_SIMPLE_ENTRY_EXAMPLES) {
      expect(item.imageUrl.startsWith("https://files.aipictors.com/")).toBe(
        true,
      )
      expect(item.prompt.trim()).not.toBe("")
      // 作例のプロンプトに LoRA の指定などを入れない（そのまま生成に使う）
      expect(item.prompt.includes("<lora:")).toBe(false)
    }
  })
})
