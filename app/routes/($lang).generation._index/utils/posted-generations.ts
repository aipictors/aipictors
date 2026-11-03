/**
 * 生成履歴のどれが投稿済みかを決める
 * - links: 投稿画面から投稿したときの記録
 * - works: 記録がない過去の投稿は、Seed とプロンプトが同じ作品を探す
 *   （Seed を固定して生成することがあるので、Seed だけでは同じと見なさない）
 */

type Task = {
  nanoid?: string | null
  seed?: number | null
  prompt?: string | null
}

type Posted = {
  links: readonly { nanoid: string | null; workId: string | null }[] | null
  works:
    | readonly {
        workId: string | null
        seed: string | null
        prompt: string | null
      }[]
    | null
}

/** 空白と区切りの違いは同じと見なす */
const normalizePrompt = (prompt: string) =>
  prompt
    .toLowerCase()
    .replace(/[\s,]+/g, " ")
    .trim()

/** 調べる Seed（-1 はランダム指定のまま、0 は未設定なので探さない） */
export function toSearchableSeeds(tasks: readonly Task[]) {
  return [
    ...new Set(
      tasks.flatMap((task) =>
        typeof task.seed === "number" && task.seed > 0
          ? [String(task.seed)]
          : [],
      ),
    ),
  ]
}

/** nanoid → 作品の ID */
export function toPostedWorkMap(tasks: readonly Task[], posted: Posted | null) {
  const result = new Map<string, string>()
  if (posted === null) return result

  const workBySeedAndPrompt = new Map(
    (posted.works ?? []).flatMap((work) =>
      work.workId !== null && work.seed !== null && work.prompt !== null
        ? [
            [
              `${work.seed}|${normalizePrompt(work.prompt)}`,
              work.workId,
            ] as const,
          ]
        : [],
    ),
  )
  for (const task of tasks) {
    if (!task.nanoid || typeof task.seed !== "number" || task.seed <= 0) {
      continue
    }
    if (!task.prompt || normalizePrompt(task.prompt) === "") continue
    const workId = workBySeedAndPrompt.get(
      `${task.seed}|${normalizePrompt(task.prompt)}`,
    )
    if (workId !== undefined) result.set(task.nanoid, workId)
  }
  // 投稿画面の記録を優先する
  for (const link of posted.links ?? []) {
    if (link.nanoid !== null && link.workId !== null) {
      result.set(link.nanoid, link.workId)
    }
  }
  return result
}
