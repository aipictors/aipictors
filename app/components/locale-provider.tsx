import { LocaleContext } from "~/contexts/locale-context"
import type { Locale } from "~/contexts/locale-context"

// 読み取り専用ロケール Provider（現段階では setLocale 未実装）
// 将来的に Cookie やユーザ設定反映に拡張予定
export function LocaleProvider(props: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const { children, initialLocale } = props
  return (
    <LocaleContext.Provider value={{ locale: initialLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}
