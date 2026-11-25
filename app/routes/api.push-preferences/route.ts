import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import {
  callAipictorsApi,
  requireViewer,
} from "~/lib/server/viewer-api-route.server"

/** アプリのプッシュ通知の種類ごとのオン・オフ（行が無ければ全部オン） */
export type PushPreferences = {
  generation: boolean
  ranking: boolean
  digest: boolean
}

const KINDS = ["generation", "ranking", "digest"] as const

/**
 * アプリのプッシュ通知の設定（aipictors-api の /internal/app-push/preferences）。アプリが使う
 *
 * GET  /api/push-preferences … 自分の設定
 * POST /api/push-preferences { generation?, ranking?, digest? } … 渡した項目だけ変える
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const result = await callAipictorsApi<PushPreferences>(
    context,
    `/internal/app-push/preferences/${encodeURIComponent(viewer.userId)}`,
  )
  return toJsonResponse(
    { error: result.error, data: result.data },
    result.error ? 502 : 200,
  )
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const input = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >
  const body: Partial<PushPreferences> = {}
  for (const kind of KINDS) {
    if (typeof input[kind] === "boolean") body[kind] = input[kind] as boolean
  }
  const result = await callAipictorsApi<PushPreferences>(
    context,
    `/internal/app-push/preferences/${encodeURIComponent(viewer.userId)}`,
    { method: "POST", body },
  )
  return toJsonResponse(
    { error: result.error, data: result.data },
    result.error ? 502 : 200,
  )
}
