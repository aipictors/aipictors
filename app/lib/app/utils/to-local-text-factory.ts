import { toLocalText } from "~/lib/app/utils/to-local-text"

export function toLocalTextFactory(
  locale: string,
): (ja: string, en: string) => string {
  return (ja: string, en: string): string => {
    return toLocalText(locale, ja, en)
  }
}
