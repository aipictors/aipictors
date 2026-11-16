type SuggestedTag = { id: string; text: string }

/**
 * タグ欄の下に出す候補を「最近使ったタグ」と「おすすめタグ」に分ける
 * - すでに付けたタグは出さない
 * - 最近使ったタグに出したものは、おすすめタグに重ねて出さない
 */
export function splitPostFormTagSuggestions<T extends SuggestedTag>(props: {
  tags: SuggestedTag[]
  recentlyUsedTags: T[]
  recommendedTags: T[]
}): { recentlyUsedTags: T[]; recommendedTags: T[] } {
  const seen = new Set(props.tags.map((tag) => tag.text))
  const pick = (tags: T[]) =>
    tags.filter((tag) => {
      if (tag.text === "" || seen.has(tag.text)) {
        return false
      }
      seen.add(tag.text)
      return true
    })
  const recentlyUsedTags = pick(props.recentlyUsedTags)
  const recommendedTags = pick(props.recommendedTags)
  return { recentlyUsedTags, recommendedTags }
}
