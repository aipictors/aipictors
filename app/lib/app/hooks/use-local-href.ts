import { useLocale } from "~/lib/app/hooks/use-locale"
import { toLocalHrefFactory } from "~/lib/app/utils/to-local-href-factory"

/**
 * 言語設定を含むパスを取得する
 */
export function useLocalHref() {
  const locale = useLocale()

  return toLocalHrefFactory(locale)
}
