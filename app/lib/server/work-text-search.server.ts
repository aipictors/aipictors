import { TEXT_SEARCH_COUNT_LIMIT } from "~/lib/work-text-search-constants"

/**
 * 作品のタイトル・説明・タグの部分一致検索（Cloudflare D1 の検索用データベース aipictors-search）
 *
 * MySQL の LIKE '%…%' は全件を読むので重く、使っていなかった。
 * 公開中の作品のタイトル・英語タイトル・説明（先頭 300 文字）・タグ（スペース区切り）を D1 に写し、
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

/** 短い語の検索結果を置く KV（ページの共有キャッシュと同じ namespace） */
export const getSearchCacheKv = (context: unknown): SearchCacheKv | null => {
  const env = (context as { cloudflare?: { env?: Record<string, unknown> } })
    ?.cloudflare?.env
  const kv = env?.PAGE_CACHE
  return kv && typeof (kv as SearchCacheKv).get === "function"
    ? (kv as SearchCacheKv)
    : null
}

/** popular: タイトルに含むものを先にしていいね順、new / old: 投稿日順 */
export type WorkTextSearchOrder = "popular" | "new" | "old"

const toDateOrderSql = (order: WorkTextSearchOrder, column: string) =>
  order === "old" ? `${column} ASC` : `${column} DESC`

/**
 * D1 がまれに 40 秒以上応答しないことがあり、検索ページ全体が表示されなくなっていた。
 * 待つのはこの時間までにして、間に合わなければ失敗扱いにする（呼び出し側はタイトル・説明の結果なしで表示する）
 */
const TEXT_SEARCH_TIMEOUT_MS = 3000

export function searchWorkIdsByText(props: {
  db: D1Like
  kv?: SearchCacheKv | null
  query: string
  rating: "G" | "R15" | "R18"
  order?: WorkTextSearchOrder
  offset: number
  limit: number
  skipShortScan?: boolean
}): Promise<{ ids: string[]; count: number }> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("text search timed out")),
      TEXT_SEARCH_TIMEOUT_MS,
    )
  })
  return Promise.race([queryWorkIdsByText(props), timeout]).finally(() => {
    clearTimeout(timer)
  })
}

/**
 * 検索結果の ID をデータセンターの中で使い回す（FTS は 10 分、LIKE の全件読みは 1 日）。
 * 2 文字以下の語は trigram が使えず、1 回で約 66 万行読む（一覧と件数でページごとに 2 回）。
 * 上位をまとめて 1 回だけ読み、件数とどのページもその結果から返す。
 * LIKE の結果は全拠点共通の KV にも置く（読み直しが高いので）。
 */
const SEARCH_CACHE_ORIGIN = "https://www.aipictors.com/__cache/text-search/"
const FTS_CACHE_TTL_SECONDS = 60 * 10
/**
 * 2 文字以下の語で読む作品の上限（いいね順・投稿日順の上位。全件は 1 回 71 万行）。
 * 結果は上位 1,000 件までなので、上位 4 万件から探せば足りる（15 万件だと語ごとに 1 回 15 万行で、search DB の読み取りの 6 割だった）
 */
const SHORT_WORD_SCAN_LIMIT = 40_000
/** 2 文字以下の語の結果は 1 日使い回す（語・年齢・並び順の組み合わせが多く、6 時間だと読み直しが多い） */
const LIKE_CACHE_TTL_SECONDS = 60 * 60 * 24

type SearchCacheKv = {
  get(key: string): Promise<string | null>
  put(
    key: string,
    value: string,
    options: { expirationTtl: number },
  ): Promise<void>
}

const getEdgeCache = () =>
  (globalThis as unknown as { caches?: { default?: Cache } }).caches?.default

const toSearchCacheKey = async (key: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  )
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

async function cachedSearchIds(props: {
  key: string
  ttlSeconds: number
  kv?: SearchCacheKv | null
  load: () => Promise<number[]>
}): Promise<number[]> {
  const hash = await toSearchCacheKey(props.key)
  const url = `${SEARCH_CACHE_ORIGIN}${hash}`
  const cache = getEdgeCache()
  const putEdge = async (body: string) => {
    await cache
      ?.put(
        url,
        new Response(body, {
          headers: {
            "content-type": "application/json",
            "cache-control": `public, max-age=${props.ttlSeconds}`,
          },
        }),
      )
      .catch(() => undefined)
  }
  const hit = await cache?.match(url).catch(() => undefined)
  if (hit) {
    return (await hit.json()) as number[]
  }
  const shared = await props.kv?.get(`text-search:${hash}`).catch(() => null)
  if (shared) {
    await putEdge(shared)
    return JSON.parse(shared) as number[]
  }
  const ids = await props.load()
  const body = JSON.stringify(ids)
  await putEdge(body)
  await props.kv
    ?.put(`text-search:${hash}`, body, { expirationTtl: props.ttlSeconds })
    .catch(() => undefined)
  return ids
}

async function queryWorkIdsByText(props: {
  db: D1Like
  kv?: SearchCacheKv | null
  query: string
  rating: "G" | "R15" | "R18"
  order?: WorkTextSearchOrder
  offset: number
  limit: number
  skipShortScan?: boolean
}): Promise<{ ids: string[]; count: number }> {
  const query = props.query.trim().slice(0, 50)
  if (query.length === 0) {
    return { ids: [], count: 0 }
  }
  const ratings = RATING_CODES[props.rating]
  const order = props.order ?? "popular"
  // 投稿日順で公開前の予約投稿が先頭に来ると、GraphQL で落ちてページが欠ける
  const isDateOrder = order !== "popular"
  const nowSeconds = Math.floor(Date.now() / 1000)
  const ratingPlaceholders = ratings.map(() => "?").join(",")
  const likePattern = `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

  // trigram は 3 文字以上でないと使えない
  const useFts = Array.from(query).length >= 3
  // クローラーには 2 文字以下の全文検索はしない（タグの一致は別に出る）
  if (!useFts && props.skipShortScan) {
    return { ids: [], count: 0 }
  }
  const match = `"${query.replace(/"/g, '""')}"`
  // タイトル・説明の索引とタグの索引のどちらかに当たった作品
  const matchedIds = `(w.id IN (SELECT rowid FROM works_fts WHERE works_fts MATCH ?)
        OR w.id IN (SELECT rowid FROM works_tags_fts WHERE works_tags_fts MATCH ?))`

  const selectIds = (limit: number, offset: number) =>
    useFts
      ? props.db
          .prepare(
            `SELECT w.id AS id FROM works w
           WHERE ${matchedIds} AND w.rating IN (${ratingPlaceholders})
             ${isDateOrder ? "AND w.created_at <= ?" : ""}
           ORDER BY ${
             order === "popular"
               ? "(w.title LIKE ? ESCAPE '\\') DESC, w.likes DESC"
               : toDateOrderSql(order, "w.created_at")
           }
           LIMIT ? OFFSET ?`,
          )
          .bind(
            match,
            match,
            ...ratings,
            ...(isDateOrder ? [nowSeconds] : [likePattern]),
            limit,
            offset,
          )
          .all<{ id: number }>()
      : props.db
          .prepare(
            `SELECT id FROM (
              SELECT id, title, en_title, tags, rating, likes, created_at FROM works
               ORDER BY ${order === "popular" ? "likes DESC" : toDateOrderSql(order, "created_at")}
               LIMIT ${SHORT_WORD_SCAN_LIMIT}
            )
          WHERE (title LIKE ? ESCAPE '\\' OR en_title LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\')
            AND rating IN (${ratingPlaceholders})
            ${isDateOrder ? "AND created_at <= ?" : ""}
          ORDER BY ${
            order === "popular"
              ? "likes DESC"
              : toDateOrderSql(order, "created_at")
          } LIMIT ? OFFSET ?`,
          )
          .bind(
            likePattern,
            likePattern,
            likePattern,
            ...ratings,
            ...(isDateOrder ? [nowSeconds] : []),
            limit,
            offset,
          )
          .all<{ id: number }>()

  if (props.offset + props.limit <= TEXT_SEARCH_COUNT_LIMIT) {
    const ids = await cachedSearchIds({
      key: JSON.stringify([query, props.rating, order]),
      ttlSeconds: useFts ? FTS_CACHE_TTL_SECONDS : LIKE_CACHE_TTL_SECONDS,
      kv: useFts ? null : props.kv,
      load: async () =>
        (await selectIds(TEXT_SEARCH_COUNT_LIMIT, 0)).results.map(
          (row) => row.id,
        ),
    })
    return {
      ids: ids
        .slice(props.offset, props.offset + props.limit)
        .map((id) => String(id)),
      count: ids.length,
    }
  }

  // 2 文字以下は全件を読むことになるので、候補の範囲より先のページは探さない
  if (!useFts) {
    return { ids: [], count: TEXT_SEARCH_COUNT_LIMIT }
  }

  const countSql = useFts
    ? `SELECT count(*) AS c FROM (
             SELECT 1 FROM works w
              WHERE ${matchedIds} AND w.rating IN (${ratingPlaceholders})
              LIMIT ${TEXT_SEARCH_COUNT_LIMIT})`
    : `SELECT count(*) AS c FROM (
           SELECT 1 FROM works
            WHERE (title LIKE ? ESCAPE '\\' OR en_title LIKE ? ESCAPE '\\' OR tags LIKE ? ESCAPE '\\')
              AND rating IN (${ratingPlaceholders})
            LIMIT ${TEXT_SEARCH_COUNT_LIMIT})`
  const [rows, countRow] = await Promise.all([
    selectIds(props.limit, props.offset),
    props.db
      .prepare(countSql)
      .bind(
        ...(useFts
          ? [match, match]
          : [likePattern, likePattern, likePattern]),
        ...ratings,
      )
      .first<{ c: number }>(),
  ])
  return {
    ids: rows.results.map((row) => String(row.id)),
    count: countRow?.c ?? 0,
  }
}
