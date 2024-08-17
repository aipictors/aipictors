import { toLocalText } from "~/lib/app/utils/to-local-text"

export function toLocalTextFactory(locale: string) {
  return (ja: string, en: string) => {
    return toLocalText(locale, ja, en)
  }
}
