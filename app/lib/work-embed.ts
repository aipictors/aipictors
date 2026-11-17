/**
 * 作品の埋め込み（ブログなどに iframe で置くカード）と oEmbed。
 *
 * アプリ本体を読み込まずに Worker の入口（worker-entry.ts）で返す。
 * 応答は配信のキャッシュ（CDN-Cache-Control）に 1 日置き、Cache-Tag `work-<id>` を付けるので、
 * 作品の編集・削除のあとは作品ページと一緒に消える（purgeWorkPages）。表示のたびに API・DB へは問い合わせない。
 *
 * - 公開（PUBLIC）と新着非公開（SILENT）の作品だけ。限定公開・非公開・削除済みは「表示できません」
 * - R18・R18G は年齢の確認を先に出し、確認するまで画像・タイトルを HTML に含めない（確認後は ?age=18）
 * - クエリは決まったものだけ受け付け、それ以外は正しい URL へ移す（無関係なクエリでキャッシュを外されないように）
 */

export const EMBED_SITE_URL = "https://www.aipictors.com"

export const EMBED_DEFAULT_WIDTH = 400
export const EMBED_DEFAULT_HEIGHT = 480

const EMBED_PATH = /^\/embed\/posts\/(\d{1,12})\/?$/
const OEMBED_PATH = "/api/oembed"
/** oEmbed の url に指定できる作品ページ */
const WORK_URL =
  /^https?:\/\/(?:www\.)?aipictors\.com\/(?:(?:ja|en)\/)?(?:r\/)?posts\/(\d{1,12})\/?(?:[?#].*)?$/

const CACHE_SECONDS = 60 * 60 * 24
const STALE_SECONDS = 60 * 60 * 24 * 7
/** 表示できない作品・見つからない作品は短くする（公開に変わったときに早く出るように） */
const UNAVAILABLE_CACHE_SECONDS = 60 * 60
const API_TIMEOUT_MS = 8_000

export type EmbedWork = {
  id: string
  title: string
  accessType: string
  rating: string | null
  isDeleted: boolean
  largeThumbnailImageURL: string
  user: { name: string; login: string; iconUrl: string | null } | null
}

const WORK_QUERY = `query EmbedWork($id: ID!) {
  work(id: $id) {
    id
    title
    accessType
    rating
    isDeleted
    largeThumbnailImageURL
    user { name login iconUrl }
  }
}`

export const isAdultRating = (rating: string | null) =>
  rating === "R18" || rating === "R18G"

export const isEmbeddable = (work: EmbedWork | null): work is EmbedWork =>
  work !== null &&
  (work.accessType === "PUBLIC" || work.accessType === "SILENT") &&
  !work.isDeleted

export const toWorkPageUrl = (work: Pick<EmbedWork, "id" | "rating">) =>
  `${EMBED_SITE_URL}${isAdultRating(work.rating) ? "/r" : ""}/posts/${work.id}`

export const toEmbedUrl = (workId: string) =>
  `${EMBED_SITE_URL}/embed/posts/${workId}`

/**
 * 共有メニューで渡す埋め込みのコード。R18 はタイトルを属性に入れない（貼った先のページに文字で出るため）
 */
export const createEmbedCode = (work: {
  id: string
  title: string
  isAdult: boolean
}) => {
  const title = work.isAdult ? "Aipictorsの作品" : `${work.title} | Aipictors`
  return `<iframe src="${toEmbedUrl(work.id)}" width="${EMBED_DEFAULT_WIDTH}" height="${EMBED_DEFAULT_HEIGHT}" style="border:0;max-width:100%;border-radius:12px" loading="lazy" title="${escapeHtml(title)}"></iframe>`
}

export const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")

/** 画像の URL は自サイトの配信のものだけ使う */
const safeImageUrl = (value: string | null | undefined) =>
  value && /^https:\/\/[\w.-]*aipictors\.com\//.test(value) ? value : null

const STYLE = `*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;background:#0f1115;color:#f2f3f5;display:flex;flex-direction:column;overflow:hidden}
a{color:inherit;text-decoration:none}
.media{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:#000;position:relative}
.media img{width:100%;height:100%;object-fit:contain;display:block}
.gate{flex-direction:column;gap:12px;padding:16px;text-align:center;background:linear-gradient(135deg,#2a1f2d,#141820)}
.badge{display:inline-block;padding:2px 10px;border-radius:999px;background:#e5484d;color:#fff;font-weight:700;font-size:13px}
.gate p{font-size:14px;line-height:1.6;color:#d6d8dc}
.btn{display:inline-block;padding:10px 18px;border-radius:999px;background:#fff;color:#111;font-weight:700;font-size:14px}
.sub{font-size:12px;color:#a8acb3;text-decoration:underline}
.bar{display:flex;align-items:center;gap:10px;padding:10px 12px;height:64px;border-top:1px solid #23262d}
.icon{width:36px;height:36px;border-radius:50%;object-fit:cover;background:#2a2d34;flex:none}
.meta{min-width:0;flex:1}
.title{font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.author{font-size:12px;color:#a8acb3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.brand{flex:none;font-size:12px;font-weight:700;color:#7aa7ff}`

const page = (title: string, body: string) => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)}</title>
<style>${STYLE}</style>
</head>
<body>${body}</body>
</html>`

const link = (href: string, inner: string, className = "") =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener"${className ? ` class="${className}"` : ""}>${inner}</a>`

/**
 * 埋め込みの HTML。ageConfirmed が false の R18 作品は、画像・タイトルを含めない
 */
export const renderWorkEmbedHtml = (
  work: EmbedWork | null,
  options: { ageConfirmed: boolean },
) => {
  if (!isEmbeddable(work)) {
    return page(
      "Aipictors",
      `<div class="media gate"><p>この作品は表示できません<br>This work is not available.</p>${link(EMBED_SITE_URL, "Aipictorsを開く", "btn")}</div>`,
    )
  }

  const pageUrl = toWorkPageUrl(work)
  const isAdult = isAdultRating(work.rating)
  const showContent = !isAdult || options.ageConfirmed
  const iconUrl = safeImageUrl(work.user?.iconUrl)
  const imageUrl = safeImageUrl(work.largeThumbnailImageURL)
  const userName = work.user?.name ?? ""

  const media = showContent
    ? link(
        pageUrl,
        imageUrl
          ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(work.title)}">`
          : "",
        "media",
      )
    : `<div class="media gate"><span class="badge">${work.rating === "R18G" ? "R18G" : "R18"}</span><p>成人向けの作品です。18歳以上ですか？<br>This work is for adults only. Are you 18 or older?</p><a class="btn" href="/embed/posts/${work.id}?age=18">はい、18歳以上です / Yes</a>${link(EMBED_SITE_URL, "Aipictorsを開く", "sub")}</div>`

  const bar = `<div class="bar">${
    iconUrl
      ? `<img class="icon" src="${escapeHtml(iconUrl)}" alt="" loading="lazy">`
      : `<span class="icon"></span>`
  }<div class="meta"><div class="title">${link(pageUrl, escapeHtml(showContent ? work.title : "成人向けの作品"))}</div><div class="author">${escapeHtml(userName)}</div></div>${link(EMBED_SITE_URL, "Aipictors", "brand")}</div>`

  return page(
    showContent ? `${work.title} | Aipictors` : "Aipictors",
    media + bar,
  )
}

/**
 * oEmbed（type: rich）。R18 はタイトル・サムネイルを返さない
 */
export const buildOembed = (
  work: EmbedWork,
  size: { maxWidth: number | null; maxHeight: number | null },
) => {
  const width = Math.min(
    EMBED_DEFAULT_WIDTH,
    size.maxWidth ?? Number.POSITIVE_INFINITY,
  )
  const height = Math.min(
    EMBED_DEFAULT_HEIGHT,
    size.maxHeight ?? Number.POSITIVE_INFINITY,
  )
  const isAdult = isAdultRating(work.rating)
  const title = isAdult ? "Aipictorsの作品" : `${work.title} | Aipictors`
  const thumbnailUrl = isAdult
    ? null
    : safeImageUrl(work.largeThumbnailImageURL)
  return {
    version: "1.0",
    type: "rich",
    provider_name: "Aipictors",
    provider_url: EMBED_SITE_URL,
    title: isAdult ? "Aipictorsの作品" : work.title,
    ...(work.user
      ? {
          author_name: work.user.name,
          author_url: `${EMBED_SITE_URL}/users/${encodeURIComponent(work.user.login)}`,
        }
      : {}),
    width,
    height,
    html: `<iframe src="${toEmbedUrl(work.id)}" width="${width}" height="${height}" style="border:0;max-width:100%;border-radius:12px" loading="lazy" title="${escapeHtml(title)}"></iframe>`,
    ...(thumbnailUrl ? { thumbnail_url: thumbnailUrl } : {}),
    cache_age: CACHE_SECONDS,
  }
}

const parseSize = (value: string | null) => {
  if (value === null) return null
  const size = Number.parseInt(value, 10)
  return Number.isFinite(size) && size > 0 ? size : null
}

export const fetchEmbedWork = async (
  endpoint: string,
  workId: string,
): Promise<EmbedWork | null> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      provider: "aipictors",
      platform: "web",
    },
    body: JSON.stringify({ query: WORK_QUERY, variables: { id: workId } }),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`embed: API ${response.status}`)
  const body = (await response.json()) as {
    data?: { work?: EmbedWork | null } | null
    errors?: { message?: string }[]
  }
  if (body.data?.work) return body.data.work
  // 見つからない作品は data.work が null。エラー（API の不調）はキャッシュしないように投げる
  if (body.errors?.length || !body.data) {
    throw new Error(`embed: ${body.errors?.[0]?.message ?? "no data"}`)
  }
  return null
}

const cacheHeaders = (workId: string, available: boolean) => {
  const seconds = available ? CACHE_SECONDS : UNAVAILABLE_CACHE_SECONDS
  return {
    "Cache-Control": "public, max-age=300",
    "CDN-Cache-Control": `public, max-age=${seconds}, stale-while-revalidate=${STALE_SECONDS}`,
    "Cache-Tag": `work-${workId}`,
  }
}

const unavailableResponse = () =>
  new Response("Service Unavailable", {
    status: 503,
    headers: { "Cache-Control": "no-store", "Retry-After": "60" },
  })

type EmbedEnv = {
  VITE_GRAPHQL_ENDPOINT_REMIX?: string
  VITE_GRAPHQL_ENDPOINT?: string
}

/**
 * /embed/posts/<id> と /api/oembed を返す。それ以外は null
 */
export const handleEmbedRequest = async (
  request: Request,
  env: EmbedEnv,
  load: typeof fetchEmbedWork = fetchEmbedWork,
): Promise<Response | null> => {
  if (request.method !== "GET" && request.method !== "HEAD") return null
  const url = new URL(request.url)
  const embedMatch = url.pathname.match(EMBED_PATH)
  if (!embedMatch && url.pathname !== OEMBED_PATH) return null

  const endpoint =
    env.VITE_GRAPHQL_ENDPOINT_REMIX ?? env.VITE_GRAPHQL_ENDPOINT ?? null
  if (!endpoint) return unavailableResponse()

  if (embedMatch) {
    const workId = embedMatch[1] as string
    const ageConfirmed = url.searchParams.get("age") === "18"
    const canonical = `/embed/posts/${workId}${ageConfirmed ? "?age=18" : ""}`
    if (`${url.pathname}${url.search}` !== canonical) {
      return new Response(null, {
        status: 301,
        headers: {
          Location: canonical,
          "Cache-Control": "public, max-age=86400",
        },
      })
    }
    let work: EmbedWork | null
    try {
      work = await load(endpoint, workId)
    } catch (error) {
      console.error(error)
      return unavailableResponse()
    }
    return new Response(renderWorkEmbedHtml(work, { ageConfirmed }), {
      status: isEmbeddable(work) ? 200 : 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; img-src https:; style-src 'unsafe-inline'; frame-ancestors *; base-uri 'none'; form-action 'none'",
        "X-Robots-Tag": "noindex",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        ...cacheHeaders(workId, isEmbeddable(work)),
      },
    })
  }

  // oEmbed
  const format = url.searchParams.get("format") ?? "json"
  const workId = (url.searchParams.get("url") ?? "").match(WORK_URL)?.[1]
  if (format !== "json") {
    return new Response("Not Implemented", {
      status: 501,
      headers: { "Cache-Control": "public, max-age=86400" },
    })
  }
  if (!workId) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=86400" },
    })
  }
  let work: EmbedWork | null
  try {
    work = await load(endpoint, workId)
  } catch (error) {
    console.error(error)
    return unavailableResponse()
  }
  if (!isEmbeddable(work)) {
    return new Response("Not Found", {
      status: 404,
      headers: cacheHeaders(workId, false),
    })
  }
  const body = buildOembed(work, {
    maxWidth: parseSize(url.searchParams.get("maxwidth")),
    maxHeight: parseSize(url.searchParams.get("maxheight")),
  })
  return new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...cacheHeaders(workId, true),
    },
  })
}
