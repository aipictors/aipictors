import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import {
  callAipictorsApi,
  requireViewer,
} from "~/lib/server/viewer-api-route.server"

/** コメントについたリアクション（付けた順）。誰が付けたかを返すので、自分の分は画面で分かる */
export type CommentReactionEntry = { emoji: string; userIds: string[] }

export type CommentReactionMap = Record<string, CommentReactionEntry[]>

/**
 * 作品のコメント・返信へのリアクション（aipictors-api の /internal/comment-reactions）
 *
 * POST { op: "list", commentIds } … ログインなしで読める
 * POST { op: "react", commentId, emoji } … ログインが要る。emoji が空なら外す
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const input = (await request.json().catch(() => ({}))) as {
    op?: unknown
    commentIds?: unknown
    commentId?: unknown
    emoji?: unknown
  }

  if (input.op === "list") {
    const commentIds = Array.isArray(input.commentIds)
      ? input.commentIds.filter((id): id is string => typeof id === "string")
      : []
    if (commentIds.length === 0) {
      return toJsonResponse({ error: null, data: {} }, 200)
    }
    const result = await callAipictorsApi<CommentReactionMap>(
      context,
      "/internal/comment-reactions/list",
      { method: "POST", body: { commentIds } },
    )
    return toJsonResponse(
      { error: result.error, data: result.data },
      result.error ? 502 : 200,
    )
  }

  if (input.op === "react") {
    const viewer = await requireViewer(request, context)
    if (viewer instanceof Response) return viewer
    const result = await callAipictorsApi<CommentReactionEntry[]>(
      context,
      "/internal/comment-reactions/react",
      {
        method: "POST",
        body: {
          userId: viewer.userId,
          commentId: String(input.commentId ?? ""),
          emoji: typeof input.emoji === "string" ? input.emoji : "",
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
