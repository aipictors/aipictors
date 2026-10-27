import { TEXT_SEARCH_COUNT_LIMIT } from "~/lib/work-text-search-constants"

/**
 * 作品のタイトル・説明の部分一致検索（Cloudflare D1 の検索用データベース aipictors-search）
 *
 * MySQL の LIKE '%…%' は全件を読むので重く、使っていなかった。
 * 公開中の作品のタイトル・英語タイトル・説明（先頭 300 文字）だけを D1 に写し、
 * FTS5 の trigram で 3 文字以上は索引から、2 文字以下はタイトルだけを LIKE で探す。
 * D1 には ID の並びだけを聞き、作品の中身は GraphQL から取る（削除・非公開になった作品はそこで落ちる）。
 * 同期は aipic サーバーの cron（scripts/search-index/sync-works.sh）で行う。
 */

type D1Like = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
      first<T = Record<string, unknown>>(): Promise<T | null>
    }
  }
}

/** MySQL の ageLimit（0: 全年齢, 3: R15, 1: R18, 2: R18G） */
const RATING_CODES: Record<"G" | "R15" | "R18", number[]> = {
  G: [0],
  R15: [3],
  R18: [1, 2],
}


export const getSearchDb = (context: unknown): D1Like | null => {
  const env = (context as { cloudflare?: { env?: Record<string, unknown> } })
    ?.cloudflare?.env
  const db = env?.SEARCH_DB
  return db && typeof (db as D1Like).prepare === "function"
    ? (db as D1Like)
    : null
}

export async function searchWorkIdsByText(props: {
  db: D1Like
  query: string
  rating: "G" | "R15" | "R18"
  offset: number
  limit: number
}): Promise<{ ids: string[]; count: number }> {
  const query = props.query.trim().slice(0, 50)
  if (query.length === 0) {
    return { ids: [], count: 0 }
  }
  const ratings = RATING_CODES[props.rating]
  const ratingPlaceholders = ratings.map(() => "?").join(",")
  const likePattern = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

  // trigram は 3 文字以上でないと使えない
  const useFts = Array.from(query).length >= 3

  if (useFts) {
    const match = `"${query.replace(/"/g, '""')}"`
    const [rows, countRow] = await Promise.all([
      props.db
        .prepare(
          `SELECT w.id AS id FROM works_fts
            JOIN works w ON w.id = works_fts.rowid
           WHERE works_fts MATCH ? AND w.rating IN (${ratingPlaceholders})
           ORDER BY (w.title LIKE ? ESCAPE '\\') DESC, w.likes DESC
           LIMIT ? OFFSET ?`,
        )
        .bind(match, ...ratings, likePattern, props.limit, props.offset)
        .all<{ id: number }>(),
      props.db
        .prepare(
          `SELECT count(*) AS c FROM (
             SELECT 1 FROM works_fts JOIN works w ON w.id = works_fts.rowid
              WHERE works_fts MATCH ? AND w.rating IN (${ratingPlaceholders})
              LIMIT ${TEXT_SEARCH_COUNT_LIMIT})`,
        )
        .bind(match, ...ratings)
        .first<{ c: number }>(),
    ])
    return {
      ids: rows.results.map((row) => String(row.id)),
      count: countRow?.c ?? 0,
    }
  }

  const [rows, countRow] = await Promise.all([
    props.db
      .prepare(
        `SELECT id FROM works
          WHERE (title LIKE ? ESCAPE '\\' OR en_title LIKE ? ESCAPE '\\')
            AND rating IN (${ratingPlaceholders})
          ORDER BY likes DESC LIMIT ? OFFSET ?`,
      )
      .bind(likePattern, likePattern, ...ratings, props.limit, props.offset)
      .all<{ id: number }>(),
    props.db
      .prepare(
        `SELECT count(*) AS c FROM (
           SELECT 1 FROM works
            WHERE (title LIKE ? ESCAPE '\\' OR en_title LIKE ? ESCAPE '\\')
              AND rating IN (${ratingPlaceholders})
            LIMIT ${TEXT_SEARCH_COUNT_LIMIT})`,
      )
      .bind(likePattern, likePattern, ...ratings)
      .first<{ c: number }>(),
  ])
  return {
    ids: rows.results.map((row) => String(row.id)),
    count: countRow?.c ?? 0,
  }
}
