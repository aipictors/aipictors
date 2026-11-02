/** 入口に出さないタグ（全年齢の作品にも付いていることがある） */
const HIDDEN_TAG_PATTERN =
  /セクシー|エロ|おっぱい|巨乳|爆乳|ロリ|生足|nsfw|sexy|loli/i

/** 英数字とハッシュがつながった自動生成のようなタグ（例: Halloween-8dfa6e04） */
const GENERATED_TAG_PATTERN = /-[0-9a-f]{6,}$/i

/**
 * 作品に付いているタグから、よく使われているものを多い順に選ぶ
 * 2 作品以上に付いているものだけにして、1 人の投稿者だけのタグが出にくいようにする
 */
export function pickTrendingTags(
  works: readonly { tagNames?: readonly string[] | null }[],
  options: {
    limit: number
    excludes?: readonly string[]
    /** 渡すと、全年齢向けの除外の代わりにこの判定を使う（R18 の入口） */
    isAllowed?: (tag: string) => boolean
  },
): string[] {
  const excludes = new Set(options.excludes ?? [])
  const counts = new Map<string, number>()
  for (const work of works) {
    for (const tag of new Set(work.tagNames ?? [])) {
      const name = tag.trim()
      if (name.length === 0 || name.length > 16) continue
      if (excludes.has(name)) continue
      if (
        options.isAllowed ? !options.isAllowed(name) : HIDDEN_TAG_PATTERN.test(name)
      ) {
        continue
      }
      if (GENERATED_TAG_PATTERN.test(name)) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, options.limit)
    .map(([name]) => name)
}
