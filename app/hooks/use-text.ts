import { useLocale } from "~/hooks/use-locale"

export function useText() {
  const locale = useLocale()

  /**
   * 翻訳する
   * @param ja 日本語
   * @param en 英語
   * @returns
   */
  const t = (ja: string, en: string) => {
    if (locale === "en") {
      return en
    }
    return ja
  }

  return t
}
