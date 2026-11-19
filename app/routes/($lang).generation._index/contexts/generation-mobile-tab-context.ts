import { createContext } from "react"

export type GenerationMobileTab = "create" | "history"

/**
 * スマホの生成画面の「つくる / 履歴」（アプリの生成タブと同じ 2 つ）。PC では null
 */
export const GenerationMobileTabContext = createContext<{
  tab: GenerationMobileTab
  setTab: (tab: GenerationMobileTab) => void
} | null>(null)

/**
 * スマホの下の「残りのコイン」を押したときに、見出しと同じコインのシートを開くイベント
 */
export const openGenerationCoinSheetEvent = "generation:open-coin-sheet"
