import { useLocale } from "@/_lib/app/hooks/use-locale"
import { toLocalHrefFactory } from "@/_lib/app/utils/to-local-href-factory"

/**
 * 言語設定を含むパスを取得する
 * @returns
 */
export const useLocalHref = () => {
  const locale = useLocale()

  return toLocalHrefFactory(locale)
}
