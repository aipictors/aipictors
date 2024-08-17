import { useLocale } from "~/lib/app/hooks/use-locale"
import { toLocalTextFactory } from "~/lib/app/utils/to-local-text-factory"

/**
 * 言語設定を含むテキストを取得する
 */
export function useLocalText() {
  const locale = useLocale()

  return toLocalTextFactory(locale)
}
