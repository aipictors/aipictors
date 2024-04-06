import { toLocalHref } from "@/_lib/app/utils/to-local-href"

export const toLocalHrefFactory = (locale: string) => {
  return (hashes: `/${string}` | TemplateStringsArray, ...values: string[]) => {
    if (typeof hashes === "string") {
      return toLocalHref(hashes, locale)
    }
    for (const value of values) {
      if (typeof value === "undefined" || value === "") {
        console.error("パスから空の値が検出された")
        // captureException("パスから空の値が検出された")
      }
    }
    const text = values
      .map((value, index) => {
        return hashes[index] + value
      })
      .concat(hashes.slice(values.length))
      .join("")
    return toLocalHref(text as never, locale)
  }
}
