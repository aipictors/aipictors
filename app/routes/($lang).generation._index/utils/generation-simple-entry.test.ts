import { describe, expect, test } from "bun:test"
import {
  GENERATION_ENTRY_REDIRECT_SCRIPT,
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

/** GENERATION_ENTRY_REDIRECT_SCRIPT を偽の window で動かし、移した先（移さなければ null）を返す */
const runEntryRedirect = (options: {
  auth?: string
  pathname?: string
  search?: string
  userAgent?: string
  local?: Record<string, string>
  session?: Record<string, string>
}) => {
  let replaced: string | null = null
  const storage = (items: Record<string, string> = {}) => ({
    getItem: (key: string) => items[key] ?? null,
  })
  new Function(
    "document",
    "location",
    "navigator",
    "localStorage",
    "sessionStorage",
    GENERATION_ENTRY_REDIRECT_SCRIPT,
  )(
    { documentElement: { dataset: { aipAuth: options.auth ?? "out" } } },
    {
      pathname: options.pathname ?? "/generation",
      search: options.search ?? "",
      replace: (url: string) => {
        replaced = url
      },
    },
    { userAgent: options.userAgent ?? "Mozilla/5.0 (iPhone)" },
    storage(options.local),
    storage(options.session),
  )
  return replaced
}

describe("GENERATION_ENTRY_REDIRECT_SCRIPT", () => {
  test("ログインの印がない人は /generation/home へ移す", () => {
    expect(runEntryRedirect({})).toBe("/generation/home")
    expect(runEntryRedirect({ pathname: "/en/generation" })).toBe(
      "/en/generation/home",
    )
    expect(runEntryRedirect({ search: "?utm_source=x" })).toBe(
      "/generation/home",
    )
  })

  test("ログイン中・詳細画面を選んだ人・既存の導線・クローラーは移さない", () => {
    expect(runEntryRedirect({ auth: "in" })).toBeNull()
    expect(
      runEntryRedirect({ auth: undefined, pathname: "/generation/3panel" }),
    ).toBeNull()
    expect(
      runEntryRedirect({ local: { "generation.entryMode": "advanced" } }),
    ).toBeNull()
    expect(
      runEntryRedirect({
        session: { "generation.simpleEntry.pendingPrompt": "{}" },
      }),
    ).toBeNull()
    expect(runEntryRedirect({ search: "?mode=advanced" })).toBeNull()
    expect(runEntryRedirect({ search: "?prompts=cat" })).toBeNull()
    expect(
      runEntryRedirect({
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }),
    ).toBeNull()
  })
})
