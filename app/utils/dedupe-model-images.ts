/** Civitai の画像 URL の大きさの指定（/width=450/ など） */
const WIDTH_SEGMENT = /\/width=(\d+)\//

/**
 * モデルの画像を、同じ画像の大きさ違い（Civitai の width=450 と width=1024 など）を 1 枚にまとめて並べる。
 * 大きい方を残し、最初に出てきた位置に置く（サムネイルが小さい版のとき、同じ絵が 2 枚並び大きい画像も粗くなっていた）
 */
export const dedupeModelImages = (urls: string[]) => {
  const byKey = new Map<string, { url: string; width: number }>()
  for (const url of urls) {
    const key = url.replace(WIDTH_SEGMENT, "/")
    const width = Number(
      url.match(WIDTH_SEGMENT)?.[1] ?? Number.POSITIVE_INFINITY,
    )
    const current = byKey.get(key)
    if (current === undefined || width > current.width) {
      byKey.set(key, { url, width })
    }
  }
  return Array.from(byKey.values(), (item) => item.url)
}
