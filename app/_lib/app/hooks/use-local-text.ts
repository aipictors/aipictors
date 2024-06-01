import { useLocale } from "@/_lib/app/hooks/use-locale"
import { toLocalTextFactory } from "@/_lib/app/utils/to-local-text-factory"

/**
 * 言語設定を含むテキストを取得する
 */
export const useLocalText = () => {
  const locale = useLocale()

  return toLocalTextFactory(locale)
}
