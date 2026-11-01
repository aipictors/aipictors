/**
 * POST /api/support/:op
 *
 * お問い合わせ（サポートチャット）。ログイン中の本人を確かめてから aipictors-api の /internal/support を呼ぶ
 * op: thread（今のお問い合わせ）・messages（送る・AI が答える）・escalate（Discord の案内）・feedback・resolve・unread
 * 有人の窓口はないので、AI で解決できないものは Discord を案内する
 */
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const OPS = new Set([
  "thread",
  "messages",
  "escalate",
  "feedback",
  "resolve",
  "unread",
])

/**
 * AI に渡す「運営からのメッセージ」と「作品への運営の対応」（本人の分だけ）。
 * 運営からのメッセージは定型文で詳細が空のことが多いので、何をしたかの記録と合わせて渡す
 */
async function loadModerationContext(props: {
  graphqlEndpoint: string
  authorization: string
  wpUserId: string | null
}): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      authorization: props.authorization,
      platform: "web",
    }
    if (props.wpUserId) headers["wp-user-id"] = props.wpUserId
    const response = await fetch(props.graphqlEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query: `query SupportModerationContext {
          viewer {
            supportMessages(offset: 0, limit: 10) { id text createdAt isViewer }
            workActionHistories(offset: 0, limit: 20) {
              actionType createdAt summary detail title ratingLabel workUrl isModeratorAction
            }
          }
        }`,
      }),
    })
    if (!response.ok) return null
    const json = (await response.json()) as {
      data?: {
        viewer?: {
          supportMessages?: {
            text: string
            createdAt: number
            isViewer: boolean
          }[]
          workActionHistories?: {
            createdAt: number
            summary: string
            detail: string | null
            title: string | null
            ratingLabel: string | null
            workUrl: string | null
            isModeratorAction: boolean
          }[]
        } | null
      }
    }
    const viewer = json.data?.viewer
    if (!viewer) return null
    const format = (epoch: number) =>
      new Date(epoch * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
    const lines: string[] = []
    const letters = (viewer.supportMessages ?? []).filter(
      (message) =>
        !message.isViewer && !message.text.startsWith("この度はご登録いただき"),
    )
    if (letters.length > 0) {
      lines.push("運営からのメッセージ（新しい順・最大5件）:")
      for (const letter of letters.slice(0, 5)) {
        lines.push(
          `- ${format(letter.createdAt)}「${letter.text.slice(0, 400)}」`,
        )
      }
    }
    // 操作内容の「ageLimit: 0 -> 3」を、AI にわかる言葉にする
    const RATING_LABELS: Record<string, string> = {
      "0": "全年齢",
      "1": "R-15",
      "2": "R-18",
      "3": "R-18G",
    }
    const readable = (text: string) =>
      text.replace(
        /ageLimit:\s*(\d)\s*->\s*(\d)/g,
        (_, from: string, to: string) =>
          `年齢区分 ${RATING_LABELS[from] ?? from} → ${RATING_LABELS[to] ?? to}`,
      )
    const actions = (viewer.workActionHistories ?? []).filter(
      (action) => action.isModeratorAction,
    )
    if (actions.length > 0) {
      lines.push("作品への運営（モデレーター）の対応（新しい順・最大10件）:")
      for (const action of actions.slice(0, 10)) {
        lines.push(
          `- ${format(action.createdAt)} 作品「${action.title ?? "（タイトルなし）"}」${action.workUrl ? ` https://www.aipictors.com${action.workUrl}` : ""}: ${action.summary}${action.detail ? `（${readable(action.detail).slice(0, 200)}）` : ""}${action.ratingLabel ? ` 今の年齢区分: ${action.ratingLabel}` : ""}`,
        )
      }
    }
    return lines.length > 0 ? lines.join("\n").slice(0, 6000) : null
  } catch {
    return null
  }
}

function toJson(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function loader(_props: LoaderFunctionArgs): Promise<Response> {
  return toJson({ error: "Method not allowed", data: null }, 405)
}

export async function action({
  request,
  context,
  params,
}: ActionFunctionArgs): Promise<Response> {
  const op = params.op ?? ""
  if (!OPS.has(op)) {
    return toJson({ error: "Not found", data: null }, 404)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!graphqlEndpoint) {
    return toJson(
      { error: "GraphQL endpoint is not configured", data: null },
      500,
    )
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
  if (!viewer) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const input = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >

  // 本人の ID・プラン・メールアドレスはサーバーで決める（送られてきた値は使わない）
  const body: Record<string, unknown> = {
    ticketId: typeof input.ticketId === "string" ? input.ticketId : undefined,
    body: typeof input.body === "string" ? input.body : undefined,
    escalate: input.escalate === true,
    newTicket: input.newTicket === true,
    messageId:
      typeof input.messageId === "string" ? input.messageId : undefined,
    helpful: input.helpful === true,
    userName:
      typeof input.userName === "string"
        ? input.userName.slice(0, 80)
        : undefined,
    userId: viewer.userId,
    passType: viewer.currentPassType,
    contactEmail: viewer.userEmail ?? undefined,
  }

  if (op === "messages") {
    const extraContext = await loadModerationContext({
      graphqlEndpoint,
      authorization,
      wpUserId: request.headers.get("wp-user-id"),
    })
    if (extraContext) body.extraContext = extraContext
  }

  const response = await fetch(
    `${getApiBaseUrl(context)}/internal/support/${op}`,
    {
      method: "POST",
      headers: getInternalHeaders(context),
      body: JSON.stringify(body),
    },
  )
  const text = await response.text()
  return new Response(text, {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
