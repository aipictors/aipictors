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
 * 募集リクエスト（aipictors-api の /internal/open-requests へ、ログインを確かめてから転送する）
 *
 * GET  /api/open-requests?op=config | list&status=&sort=&r18=&mine=requested|proposed | detail&id= | showcase&userId=&r18= | admin-list | admin-detail&id=
 * POST /api/open-requests { op: "create" | "action" | "propose" | "proposal-action" | "admin-action", ... }
 *
 * list・detail・showcase はログインしなくても見られる（ログインしていれば自分のいいねも返す）
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

const call = async (
  context: unknown,
  path: string,
  init?: { method?: string; body?: unknown },
) => {
  // 一覧・募集は /internal/open-requests そのもの（末尾に / を付けると 404）
  const response = await fetch(
    `${getApiBaseUrl(context)}/internal/open-requests${path.replace(/^\/(?=\?|$)/, "")}`,
    {
      method: init?.method ?? "GET",
      headers: {
        ...getInternalHeaders(context),
        "content-type": "application/json",
      },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const op = url.searchParams.get("op") ?? ""
  const q = (key: string) => url.searchParams.get(key) ?? ""
  const viewer = request.headers.get("authorization")
    ? await verify(request, context)
    : null
  const me = viewer?.userId ?? ""

  if (op === "config") {
    return call(context, `/config?userId=${encodeURIComponent(me)}`)
  }
  if (op === "list") {
    const params = new URLSearchParams()
    for (const key of ["status", "sort", "r18", "limit", "offset"]) {
      if (q(key)) params.set(key, q(key))
    }
    if (q("mine")) {
      if (!me) return toJson({ error: "Unauthorized", data: null }, 401)
      params.set(
        q("mine") === "proposed" ? "proposerUserId" : "requesterUserId",
        me,
      )
    }
    if (me) params.set("viewerUserId", me)
    return call(context, `/?${params.toString()}`)
  }
  if (op === "detail") {
    return call(
      context,
      `/${encodeURIComponent(q("id"))}?viewerUserId=${encodeURIComponent(me)}`,
    )
  }
  if (op === "showcase") {
    const params = new URLSearchParams()
    for (const key of ["userId", "r18", "limit", "offset"]) {
      if (q(key)) params.set(key, q(key))
    }
    return call(context, `/showcase?${params.toString()}`)
  }
  if (op === "admin-list" || op === "admin-detail") {
    if (!viewer) return toJson({ error: "Unauthorized", data: null }, 401)
    if (!viewer.isModerator) {
      return toJson({ error: "Forbidden", data: null }, 403)
    }
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
  const target = encodeURIComponent(String(id ?? ""))

  switch (op) {
    case "create":
      return call(context, "/", {
        method: "POST",
        body: { ...rest, requesterUserId: me },
      })
    case "action":
      return call(context, `/${target}/action`, {
        method: "POST",
        body: { ...rest, userId: me },
      })
    case "propose":
      return call(context, `/${target}/proposals`, {
        method: "POST",
        body: { ...rest, userId: me },
      })
    case "proposal-action":
      return call(context, `/proposals/${target}/action`, {
        method: "POST",
        body: { ...rest, userId: me },
      })
    case "admin-action":
      if (!viewer.isModerator) {
        return toJson({ error: "Forbidden", data: null }, 403)
      }
      return call(context, `/admin/${target}`, {
        method: "POST",
        body: { ...rest, moderatorUserId: me },
      })
    default:
      return toJson({ error: "Unknown op", data: null }, 400)
  }
}
