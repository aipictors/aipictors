/**
 * 言語設定に応じてテキストを返す
 * @param locale
 * @param ja
 * @param en
 * @returns
 */
export const toLocalText = (locale: string, ja: string, en: string) => {
  if (locale === "en") {
    return en
  }

  return ja
}
