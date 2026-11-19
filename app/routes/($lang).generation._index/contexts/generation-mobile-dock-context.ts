import { createContext, useContext } from "react"

/**
 * スマホの下の入力欄のチップから開くシート
 */
export type GenerationMobileSheetKind =
  | "model"
  | "lora"
  | "styles"
  | "size"
  | "count"
  | "settings"

/**
 * スマホの下の入力欄で開いているシート（null は閉じている）。PC では null
 */
export const GenerationMobileDockContext = createContext<{
  sheet: GenerationMobileSheetKind | null
  setSheet: (sheet: GenerationMobileSheetKind | null) => void
} | null>(null)

export function useGenerationMobileDock() {
  return useContext(GenerationMobileDockContext)
}
