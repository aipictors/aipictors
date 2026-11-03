/**
 * API ルートの JSON レスポンス（キャッシュしない）
 */
export function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}
