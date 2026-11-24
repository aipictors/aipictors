/**
 * はじめての人向けの「かんたん入口」の保存まわり
 * - 入口の選択（詳細画面で開くか）は localStorage に覚える
 * - 押したあとに生成を始めるプロンプトは sessionStorage に置く（ログインをはさんでも消さない）
 */

/**
 * 「次から詳細画面で開く」を覚えるキー
 */
export const GENERATION_ENTRY_MODE_STORAGE_KEY = "generation.entryMode"

/**
 * かんたん入口から生成を始めるプロンプトを置くキー
 */
export const GENERATION_PENDING_PROMPT_STORAGE_KEY =
  "generation.simpleEntry.pendingPrompt"

/**
 * ログインに時間がかかっても待つ長さ。過ぎたものは使わない（あとで急に生成が始まらないように）
 */
export const GENERATION_PENDING_PROMPT_TTL_MS = 30 * 60 * 1000

/**
 * 既存の導線（プロンプトやモデルを URL で渡すリンク、本人確認の戻りなど）で使う URL パラメータ。
 * どれかがあれば詳細画面で開いて、今までどおり読み込ませる
 */
const ADVANCED_SEARCH_PARAM_NAMES = [
  "prompts",
  "negativeprompts",
  "ref",
  "work",
  "model",
  "userModel",
  "lora",
  "result",
]

export type GenerationPendingPrompt = {
  prompt: string
  createdAt: number
}

/**
 * URL から詳細画面で開くかを決める（?mode=advanced か、既存の導線のパラメータ）
 */
export function isAdvancedEntryRequested(search: string): boolean {
  const params = new URLSearchParams(search)
  if (params.get("mode") === "advanced") return true
  return ADVANCED_SEARCH_PARAM_NAMES.some((name) => params.has(name))
}

/**
 * 保存しておいたプロンプトを読む。形が違うもの・古いものは null
 */
export function parseGenerationPendingPrompt(
  value: string | null,
  now: number,
): GenerationPendingPrompt | null {
  if (value === null) return null
  try {
    const data: unknown = JSON.parse(value)
    if (typeof data !== "object" || data === null) return null
    const prompt = "prompt" in data ? data.prompt : null
    const createdAt = "createdAt" in data ? data.createdAt : null
    if (typeof prompt !== "string" || prompt.trim() === "") return null
    if (typeof createdAt !== "number") return null
    if (now - createdAt > GENERATION_PENDING_PROMPT_TTL_MS) return null
    if (createdAt > now + 60 * 1000) return null
    return { prompt, createdAt }
  } catch {
    return null
  }
}

const readStorage = (storage: () => Storage, key: string) => {
  try {
    return storage().getItem(key)
  } catch {
    return null
  }
}

const writeStorage = (storage: () => Storage, key: string, value: string) => {
  try {
    storage().setItem(key, value)
  } catch {
    // プライベートモードなどで保存できなくても入口は使える
  }
}

const removeStorage = (storage: () => Storage, key: string) => {
  try {
    storage().removeItem(key)
  } catch {
    // 保存できない環境では何もしない
  }
}

const local = () => window.localStorage

const session = () => window.sessionStorage

/**
 * 次から詳細画面で開くか
 */
export function readPrefersAdvancedEntry(): boolean {
  if (typeof window === "undefined") return false
  return readStorage(local, GENERATION_ENTRY_MODE_STORAGE_KEY) === "advanced"
}

/**
 * 次から詳細画面で開くようにする（「詳細設定で開く」を押した・一度生成した・履歴がある）
 */
export function savePrefersAdvancedEntry() {
  if (typeof window === "undefined") return
  writeStorage(local, GENERATION_ENTRY_MODE_STORAGE_KEY, "advanced")
}

export function readGenerationPendingPrompt(): GenerationPendingPrompt | null {
  if (typeof window === "undefined") return null
  return parseGenerationPendingPrompt(
    readStorage(session, GENERATION_PENDING_PROMPT_STORAGE_KEY),
    Date.now(),
  )
}

export function saveGenerationPendingPrompt(prompt: string) {
  if (typeof window === "undefined") return
  const value: GenerationPendingPrompt = { prompt, createdAt: Date.now() }
  writeStorage(
    session,
    GENERATION_PENDING_PROMPT_STORAGE_KEY,
    JSON.stringify(value),
  )
}

export function clearGenerationPendingPrompt() {
  if (typeof window === "undefined") return
  removeStorage(session, GENERATION_PENDING_PROMPT_STORAGE_KEY)
}

/**
 * /generation の HTML に置く: ログインの印が何もない人（HEADER_USER_INLINE_SCRIPT が data-aip-auth="out" にする）は、
 * 生成画面の JS を読む前に /generation/home へ移す（useGenerationEntryMode と同じ条件。ログイン待ちのプロンプトがあれば移さない）。
 * これまでは JS を読んで描いてから移っていて、はじめての人の表示が 10 秒近くかかっていた。
 * 検索エンジンのクローラーは移さない（/generation のページとして読んでもらう）
 */
export const GENERATION_ENTRY_REDIRECT_SCRIPT = `(function(){try{if(document.documentElement.dataset.aipAuth!=="out"||/bot|crawl|spider|slurp|inspectiontool|mediapartners/i.test(navigator.userAgent))return;if(localStorage.getItem(${JSON.stringify(GENERATION_ENTRY_MODE_STORAGE_KEY)})==="advanced"||sessionStorage.getItem(${JSON.stringify(GENERATION_PENDING_PROMPT_STORAGE_KEY)}))return;var p=new URLSearchParams(location.search);if(p.get("mode")==="advanced"||${JSON.stringify(ADVANCED_SEARCH_PARAM_NAMES)}.some(function(n){return p.has(n)}))return;var h=location.pathname.replace(/\\/generation\\/?$/,"/generation/home");if(h!==location.pathname)location.replace(h)}catch(e){}})()`
