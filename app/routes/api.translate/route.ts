/**
 * POST /api/translate
 * { texts: string[], target: "en" | "ja" } → { data: { translations: (string | null)[] } }
 *
 * 利用者が書いた文（コメント・プロフィール文・リクエストの文・AI評価コメントなど）の自動翻訳。
 * aipictors-api の /internal/translations/translate を呼ぶ。訳はそこに保存されていて、
 * 同じ文は 2 回目から Google Apps Script（1 日の回数に上限がある）を呼ばない
 */
import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { toJsonResponse } from "~/lib/server/json-response.server"

/** 1 回に送れる文の数と、1 つの文の長さ（aipictors-api と同じ） */
const MAX_TEXTS = 50
const MAX_TEXT_LENGTH = 3000

export async function action({
  request,
  context,
}: ActionFunctionArgs): Promise<Response> {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const body = (await request.json().catch(() => null)) as {
    texts?: unknown
    target?: unknown
  } | null
  const target = body?.target
  const texts = body?.texts
  if (target !== "en" && target !== "ja") {
    return toJsonResponse({ error: "target must be en or ja", data: null }, 400)
  }
  if (
    !Array.isArray(texts) ||
    texts.length === 0 ||
    texts.length > MAX_TEXTS ||
    texts.some(
      (text) => typeof text !== "string" || text.length > MAX_TEXT_LENGTH,
    )
  ) {
    return toJsonResponse({ error: "invalid texts", data: null }, 400)
  }

  try {
    const response = await fetch(
      `${getApiBaseUrl(context)}/internal/translations/translate`,
      {
        method: "POST",
        headers: getInternalHeaders(context),
        body: JSON.stringify({ texts, target }),
      },
    )
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    })
  } catch {
    return toJsonResponse({ error: "translation failed", data: null }, 502)
  }
}
