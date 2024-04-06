import { useLocale } from "@/_hooks/use-locale"

export const useText = () => {
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
