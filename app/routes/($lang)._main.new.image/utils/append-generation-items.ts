import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"

type Item = PostImageFormState["items"][number]

/**
 * 生成履歴から選んだ画像を一覧の後ろに足す（選んだ順）。
 * すでに入っている生成画像は足さない。生成画像は nanoid で見分ける
 * （画像の中身はモザイク・描き込み・読み直しで変わるので、中身だけでは見分けられない）。
 * nanoid のない画像だけ中身で見分ける
 */
export const appendGenerationItems = (
  items: Item[],
  urls: string[],
  nanoids: string[] | undefined,
): Item[] => {
  const nanoidSet = new Set(
    items.flatMap((item) =>
      item.generationNanoid ? [item.generationNanoid] : [],
    ),
  )
  const contentSet = new Set(
    items.flatMap((item) => (item.content ? [item.content] : [])),
  )
  const usedIds = new Set(items.map((item) => item.id))
  let nextId = items.reduce((max, item) => Math.max(max, item.id), -1) + 1

  const next = [...items]
  for (const [index, url] of urls.entries()) {
    const nanoid = nanoids?.[index] || null
    if (nanoid !== null ? nanoidSet.has(nanoid) : contentSet.has(url)) continue
    if (nanoid !== null) nanoidSet.add(nanoid)
    contentSet.add(url)
    // id がほかの画像と重なると、外す・並べ替えで別の画像まで動くので重ならない番号にする
    while (usedIds.has(nextId)) nextId += 1
    usedIds.add(nextId)
    next.push({ id: nextId, content: url, generationNanoid: nanoid })
  }
  return next
}
