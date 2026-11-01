/**
 * 実績のシェア（カード画像・シェア用 URL・各 SNS の投稿画面）
 */

const CARD_ORIGIN = "https://card.aipictors.com"

const SITE_ORIGIN = "https://www.aipictors.com"

/**
 * シェアカードの画像（card.aipictors.com の Worker で作る）。
 * 達成数と日付を URL に入れて、増えたら（日が変わったら）X などが新しい画像を取り直すようにする。
 * card.aipictors.com のキャッシュはクエリ文字列を見ないので、パスに入れる
 */
export function toAchievementShareCardUrl(props: {
  userId: string
  unlockedCount: number
  highlight?: string | null
  now?: Date
}) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" })
    .format(props.now ?? new Date())
    .replaceAll("-", "")
  const version = `${props.unlockedCount}-${day}`
  const highlight = props.highlight ? `/${props.highlight}` : ""
  return `${CARD_ORIGIN}/achievements/${props.userId}/${version}${highlight}.png`
}

/** シェアするページ（開くとカードが大きく出る） */
export function toAchievementSharePageUrl(props: {
  userId: string
  highlight?: string | null
}) {
  const params = new URLSearchParams({ user: props.userId })
  if (props.highlight) params.set("highlight", props.highlight)
  return `${SITE_ORIGIN}/achievements?${params.toString()}`
}

export function toAchievementShareText(props: {
  level: number
  unlockedCount: number
  totalCount: number
  highlightName?: string | null
}) {
  if (props.highlightName) {
    return `Aipictorsで実績「${props.highlightName}」を達成しました🏅（実績 ${props.unlockedCount}/${props.totalCount}・Lv.${props.level}）\n#Aipictors #Aipictors実績`
  }
  return `Aipictorsの実績 ${props.unlockedCount}/${props.totalCount} を達成！実績レベル Lv.${props.level}🏅\n#Aipictors #Aipictors実績`
}

export function toShareIntentUrls(props: { text: string; url: string }) {
  const text = encodeURIComponent(props.text)
  const url = encodeURIComponent(props.url)
  const textWithUrl = encodeURIComponent(`${props.text}\n${props.url}`)
  return {
    x: `https://x.com/intent/post?text=${text}&url=${url}`,
    bluesky: `https://bsky.app/intent/compose?text=${textWithUrl}`,
    line: `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    threads: `https://www.threads.net/intent/post?text=${textWithUrl}`,
  }
}
