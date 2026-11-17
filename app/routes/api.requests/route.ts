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

/**
 * 有料リクエストとプラン（aipictors-api の /internal/requests へ、ログインを確かめてから転送する）。Web とアプリが使う
 *
 * GET  /api/requests?op=config | showcase&planId=|userId= | plans | plan&id= | creator&userId= | settings | list&role=&status= | detail&id= | badge | admin-list | admin-detail&id=
 * POST /api/requests { op: "save-plan" | "delete-plan" | "report-plan" | "save-settings" | "apply" | "action" | "admin-action", ... }
 *
 * plans・plan・creator はログインしなくても見られる
 */

const verify = async (
  request: Request,
  context: unknown,
): Promise<VerifiedViewer | null> => {
  const authorization = request.headers.get("authorization")
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!authorization?.startsWith("Bearer ") || !graphqlEndpoint) return null
  return verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
}

const forward = async (response: Response) =>
  new Response(await response.text(), {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

const call = async (
  context: unknown,
  path: string,
  init?: { method?: string; body?: unknown },
) =>
  forward(
    // 一覧・申し込みは aipictors-api の /internal/requests そのもの（末尾に / を付けると 404）
    await fetch(
      `${getApiBaseUrl(context)}/internal/requests${path.replace(/^\/(?=\?|$)/, "")}`,
      {
        method: init?.method ?? "GET",
        headers: {
          ...getInternalHeaders(context),
          "content-type": "application/json",
        },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      },
    ),
  )

const PLAN_QUERY_KEYS = [
  "userId",
  "category",
  "sort",
  "maxPrice",
  "maxDays",
  "r18",
  "acceptingOnly",
  "limit",
  "offset",
]

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const op = url.searchParams.get("op") ?? ""
  const q = (key: string) => url.searchParams.get(key) ?? ""

  if (op === "config") return call(context, "/config")

  // 実績（透かし入りの画像だけ。ログインしなくても見られる）
  if (op === "showcase") {
    const params = new URLSearchParams()
    for (const key of ["planId", "userId", "limit", "offset"]) {
      if (q(key)) params.set(key, q(key))
    }
    return call(context, `/showcase?${params.toString()}`)
  }

  // ログインしていなくても見られるもの（ログインしていれば本人の非公開のプランも出す）
  if (op === "plans" || op === "plan" || op === "creator") {
    const viewer = request.headers.get("authorization")
      ? await verify(request, context)
      : null
    const viewerUserId = viewer?.userId ?? ""
    if (op === "plan") {
      return call(
        context,
        `/plans/${encodeURIComponent(q("id"))}?viewerUserId=${encodeURIComponent(viewerUserId)}`,
      )
    }
    if (op === "creator") {
      return call(
        context,
        `/creators/${encodeURIComponent(q("userId"))}?viewerUserId=${encodeURIComponent(viewerUserId)}`,
      )
    }
    const params = new URLSearchParams()
    for (const key of PLAN_QUERY_KEYS) {
      if (q(key)) params.set(key, q(key))
    }
    if (q("includeHidden") === "1" && viewerUserId) {
      params.set("includeHidden", "1")
      params.set("viewerUserId", viewerUserId)
    }
    return call(context, `/plans?${params.toString()}`)
  }

  const viewer = await verify(request, context)
  if (!viewer) return toJson({ error: "Unauthorized", data: null }, 401)
  const me = encodeURIComponent(viewer.userId)

  if (op === "settings") return call(context, `/settings/${me}`)
  if (op === "badge") return call(context, `/badge/${me}`)
  if (op === "list") {
    const params = new URLSearchParams({
      userId: viewer.userId,
      role: q("role") === "sent" ? "sent" : "received",
      status: q("status") || "open",
    })
    return call(context, `/?${params.toString()}`)
  }
  if (op === "detail") {
    return call(context, `/${encodeURIComponent(q("id"))}?userId=${me}`)
  }
  if (op === "admin-list" || op === "admin-detail") {
    if (!viewer.isModerator)
      return toJson({ error: "Forbidden", data: null }, 403)
    if (op === "admin-detail") {
      return call(context, `/admin/${encodeURIComponent(q("id"))}`)
    }
    const params = new URLSearchParams()
    if (q("status")) params.set("status", q("status"))
    if (q("reported")) params.set("reported", q("reported"))
    return call(context, `/admin/list?${params.toString()}`)
  }
  return toJson({ error: "Unknown op", data: null }, 400)
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJson({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await verify(request, context)
  if (!viewer) return toJson({ error: "Unauthorized", data: null }, 401)
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  > & { op?: string; id?: string }
  const { op, id, ...rest } = body
  const me = viewer.userId

  switch (op) {
    case "save-plan":
      return call(context, "/plans", {
        method: "POST",
        body: { ...rest, userId: me },
      })
    case "delete-plan":
      return call(context, `/plans/${encodeURIComponent(String(id))}/delete`, {
        method: "POST",
        body: { userId: me, isModerator: viewer.isModerator },
      })
    case "report-plan":
      return call(context, `/plans/${encodeURIComponent(String(id))}/report`, {
        method: "POST",
        body: { userId: me, reason: rest.reason },
      })
    case "save-settings":
      return call(context, `/settings/${encodeURIComponent(me)}`, {
        method: "POST",
        body: rest,
      })
    case "apply":
      return call(context, "/", {
        method: "POST",
        body: { ...rest, requesterUserId: me },
      })
    case "action":
      return call(context, `/${encodeURIComponent(String(id))}/action`, {
        method: "POST",
        body: { ...rest, userId: me },
      })
    case "admin-action":
      if (!viewer.isModerator) {
        return toJson({ error: "Forbidden", data: null }, 403)
      }
      return call(context, `/admin/${encodeURIComponent(String(id))}`, {
        method: "POST",
        body: { ...rest, moderatorUserId: me },
      })
    default:
      return toJson({ error: "Unknown op", data: null }, 400)
  }
}
