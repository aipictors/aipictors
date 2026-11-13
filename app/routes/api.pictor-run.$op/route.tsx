/**
 * POST /api/pictor-run/:op
 *
 * ミニゲーム「ぴくたーちゃんラン」のチャットとスコアランキング。aipictors-api の /internal/pictor-run を呼ぶ
 * op: messages（チャットを読む）・ranking（ランキングを読む）は未ログインでも使える
 *     post（書き込む）・delete（消す）・score（スコアを送る）はログイン中の本人を確かめる
 * 名前・アイコン・バッジは送られてきた値を使わず、GraphQL から本人のものを取る
 *
 * GET /api/pictor-run/works
 * 背景の額ぶちに飾る、新しく投稿された全年齢の作品（誰が開いても同じなので 5 分キャッシュする）
 */
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import {
  type VerifiedViewer,
  verifyViewerFromGraphQL,
} from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse as toJson } from "~/lib/server/json-response.server"

const PUBLIC_OPS = new Set(["messages", "ranking"])
const VIEWER_OPS = new Set(["post", "delete", "score"])

type Profile = {
  id: string
  name: string
  login: string
  iconUrl: string | null
  badge: unknown
  isCommentBanned: boolean
}

const profileQuery = (withBan: boolean) => `query PictorRunProfile {
  viewer {
    user {
      id name login iconUrl ${withBan ? "isCommentBanned" : ""}
      commentBadge { level achievement { key name enName tier isHidden } }
    }
  }
}`

/**
 * 本人の名前・アイコン・コメント用のバッジ
 */
async function loadProfile(props: {
  graphqlEndpoint: string
  authorization: string
  wpUserId: string | null
}): Promise<Profile | null> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: props.authorization,
    platform: "web",
  }
  if (props.wpUserId) headers["wp-user-id"] = props.wpUserId

  // コメント禁止の状態を本人から読めない場合は、その項目を外して取り直す
  for (const withBan of [true, false]) {
    const response = await fetch(props.graphqlEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: profileQuery(withBan) }),
    })
    if (!response.ok) continue
    const json = (await response.json().catch(() => null)) as {
      data?: {
        viewer?: {
          user?: {
            id?: string
            name?: string
            login?: string
            iconUrl?: string | null
            isCommentBanned?: boolean
            commentBadge?: unknown
          } | null
        } | null
      }
    } | null
    const user = json?.data?.viewer?.user
    if (!user?.id || !user.name) continue
    return {
      id: user.id,
      name: user.name,
      login: user.login ?? "",
      iconUrl: user.iconUrl ?? null,
      badge: user.commentBadge ?? null,
      isCommentBanned: user.isCommentBanned === true,
    }
  }
  return null
}

/**
 * スタンプの画像は Aipictors の置き場所のものだけ受け付ける
 */
const toStickerUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return null
    if (
      url.hostname !== "aipictors.com" &&
      !url.hostname.endsWith(".aipictors.com")
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

// 多めに返して、遊ぶたびにこの中からランダムに選んで飾る
const ARTWORKS_COUNT = 60
const FILES_ORIGIN = "https://files.aipictors.com/"

const artworksQuery = `query PictorRunArtworks {
  works(
    offset: 0
    limit: ${ARTWORKS_COUNT}
    where: {
      ratings: [G]
      isSensitive: false
      isNowCreatedAt: true
      workType: WORK
      orderBy: DATE_CREATED
      isOneWorkPerUser: true
    }
  ) {
    id
    title
    likesCount
    smallThumbnailImageURL
    user { id name }
  }
}`

/**
 * 新しく投稿された全年齢の作品の、小さく縮めた画像
 */
async function loadArtworks(graphqlEndpoint: string) {
  const response = await fetch(graphqlEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json", platform: "web" },
    body: JSON.stringify({ query: artworksQuery }),
  })
  if (!response.ok) return []
  const json = (await response.json().catch(() => null)) as {
    data?: {
      works?:
        | {
            id?: string
            title?: string | null
            likesCount?: number | null
            smallThumbnailImageURL?: string | null
            user?: { id?: string; name?: string | null } | null
          }[]
        | null
    }
  } | null
  return (json?.data?.works ?? []).flatMap((work) => {
    const url = work.smallThumbnailImageURL
    if (!work.id || !url?.startsWith(FILES_ORIGIN) || url.includes("?")) {
      return []
    }
    // 別のドメインの画像でも絵として貼れるよう、CORS の付く配信元の縮小版を使う
    const key = url.slice(FILES_ORIGIN.length)
    return [
      {
        id: work.id,
        imageUrl: `${FILES_ORIGIN}_w/240/${key}`,
        title: (work.title ?? "").slice(0, 60),
        likesCount: Number(work.likesCount ?? 0),
        userId: work.user?.id ?? "",
        userName: (work.user?.name ?? "").slice(0, 40),
      },
    ]
  })
}

export async function loader({
  context,
  params,
}: LoaderFunctionArgs): Promise<Response> {
  if (params.op !== "works") {
    return toJson({ error: "Method not allowed", data: null }, 405)
  }
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  const works = graphqlEndpoint
    ? await loadArtworks(graphqlEndpoint).catch(() => [])
    : []
  return new Response(JSON.stringify({ error: null, data: { works } }), {
    headers: {
      "content-type": "application/json",
      // 取れなかったときは、すぐ取り直せるようにキャッシュしない
      "cache-control":
        works.length > 0 ? "public, max-age=300, s-maxage=300" : "no-store",
    },
  })
}

export async function action({
  request,
  context,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const op = params.op ?? ""
  if (!PUBLIC_OPS.has(op) && !VIEWER_OPS.has(op)) {
    return toJson({ error: "Not found", data: null }, 404)
  }

  const input = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >
  const authorization = request.headers.get("authorization")
  const wpUserId = request.headers.get("wp-user-id")
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )

  let viewer: VerifiedViewer | null = null
  if (authorization?.startsWith("Bearer ") && graphqlEndpoint) {
    viewer = await verifyViewerFromGraphQL({
      graphqlEndpoint,
      authorization,
      wpUserId,
    })
  }
  if (VIEWER_OPS.has(op) && (!viewer || !authorization || !graphqlEndpoint)) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const call = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(
      `${getApiBaseUrl(context)}/internal/pictor-run/${path}`,
      {
        method: "POST",
        headers: getInternalHeaders(context),
        body: JSON.stringify(body),
      },
    )
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    })
  }

  if (op === "messages") {
    return call("messages/list", {
      afterId: input.afterId,
      beforeId: input.beforeId,
      limit: input.limit,
    })
  }

  if (op === "ranking") {
    return call("scores/ranking", {
      period: input.period === "week" ? "week" : "all",
      userId: viewer?.userId ?? null,
    })
  }

  if (op === "delete") {
    return call("messages/delete", {
      messageId: input.messageId,
      userId: viewer?.userId,
      isModerator: viewer?.isModerator === true,
    })
  }

  const profile = await loadProfile({
    graphqlEndpoint: graphqlEndpoint ?? "",
    authorization: authorization ?? "",
    wpUserId,
  })
  if (!profile || profile.id !== viewer?.userId) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }
  const user = {
    id: profile.id,
    name: profile.name,
    login: profile.login,
    iconUrl: profile.iconUrl,
    badge: profile.badge,
  }

  if (op === "score") {
    return call("scores/submit", {
      user,
      score: input.score,
      coins: input.coins,
      durationMs: input.durationMs,
    })
  }

  if (profile.isCommentBanned) {
    return toJson({ error: "comment_banned", data: null }, 403)
  }
  return call("messages/create", {
    user,
    body: typeof input.body === "string" ? input.body : "",
    stickerId: typeof input.stickerId === "string" ? input.stickerId : null,
    stickerUrl: toStickerUrl(input.stickerUrl),
    replyToId: input.replyToId,
    mentions: Array.isArray(input.mentions) ? input.mentions.slice(0, 5) : [],
  })
}
