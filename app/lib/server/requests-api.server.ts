import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"

/** ページの loader から有料リクエストの API を読む（公開の情報だけ。失敗したら null） */
export const fetchRequestsInternal = async <T>(
  context: unknown,
  path: string,
): Promise<T | null> => {
  try {
    const response = await fetch(
      `${getApiBaseUrl(context)}/internal/requests${path}`,
      { headers: getInternalHeaders(context) },
    )
    if (!response.ok) return null
    const json = (await response.json()) as { error: string | null; data: T }
    return json.error ? null : json.data
  } catch {
    return null
  }
}
