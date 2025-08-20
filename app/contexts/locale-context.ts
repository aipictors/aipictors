import { createContext, useContext } from "react"

export type Locale = "ja" | "en"

export type LocaleContextValue = Readonly<{
  locale: Locale
}>

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (context === null) {
    // フォールバック: コンテキスト未提供時は ja を返す
    return { locale: "ja" }
  }
  return context
}
