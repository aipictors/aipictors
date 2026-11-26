import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import {
  callAipictorsApi,
  requireViewer,
} from "~/lib/server/viewer-api-route.server"
import type {
  WorkOriginalJudgmentDetail,
  WorkOriginalJudgmentLog,
  WorkOriginalJudgmentMap,
} from "~/lib/work-original-judgment"

/**
 * 作品がオリジナルか二次創作かの運営の判定（aipictors-api の /internal/work-original-judgments）
 *
 * POST { op: "list", workIds } … ログインなしで読める（判定だけ。作品ページのバッジ・推しの画面）
 * POST { op: "adminList", workIds } … モデレーターだけ。メモ・判定した人・日時も返す
 * POST { op: "logs", workId } … モデレーターだけ。判定の記録（新しい順）
 * POST { op: "set", workId, judgment, note } … モデレーターだけ。judgment: "ORIGINAL" | "FAN_WORK" | null（外す）
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const input = (await request.json().catch(() => ({}))) as {
    op?: unknown
    workIds?: unknown
    workId?: unknown
    judgment?: unknown
    note?: unknown
  }
  const workIds = Array.isArray(input.workIds)
    ? input.workIds.filter((id): id is string => typeof id === "string")
    : []

  if (input.op === "list") {
    if (workIds.length === 0) {
      return toJsonResponse({ error: null, data: {} }, 200)
    }
    const result = await callAipictorsApi<WorkOriginalJudgmentMap>(
      context,
      "/internal/work-original-judgments/list",
      { method: "POST", body: { workIds } },
    )
    return toJsonResponse(
      { error: result.error, data: result.data },
      result.error ? 502 : 200,
    )
  }

  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  if (!viewer.isModerator) {
    return toJsonResponse(
      { error: "Forbidden: moderator only", data: null },
      403,
    )
  }

  if (input.op === "adminList") {
    if (workIds.length === 0) {
      return toJsonResponse({ error: null, data: {} }, 200)
    }
    const result = await callAipictorsApi<
      Record<string, WorkOriginalJudgmentDetail>
    >(context, "/internal/work-original-judgments/list", {
      method: "POST",
      body: { workIds, withDetail: true },
    })
    return toJsonResponse(
      { error: result.error, data: result.data },
      result.error ? 502 : 200,
    )
  }

  const workId = String(input.workId ?? "")
  if (!/^\d{1,12}$/.test(workId)) {
    return toJsonResponse({ error: "Invalid workId", data: null }, 400)
  }

  if (input.op === "logs") {
    const result = await callAipictorsApi<WorkOriginalJudgmentLog[]>(
      context,
      `/internal/work-original-judgments/${workId}/logs`,
    )
    return toJsonResponse(
      { error: result.error, data: result.data },
      result.error ? 502 : 200,
    )
  }

  if (input.op === "set") {
    const judgment =
      input.judgment === "ORIGINAL" || input.judgment === "FAN_WORK"
        ? input.judgment
        : null
    const result = await callAipictorsApi<WorkOriginalJudgmentDetail | null>(
      context,
      "/internal/work-original-judgments/set",
      {
        method: "POST",
        body: {
          moderatorUserId: viewer.userId,
          workId,
          judgment,
          note: typeof input.note === "string" ? input.note : null,
        },
      },
    )
    return toJsonResponse(
      { error: result.error, data: result.data },
      result.error ? result.status : 200,
    )
  }

  return toJsonResponse({ error: "Unknown op", data: null }, 400)
}
