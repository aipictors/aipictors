import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { getCheckoutLocale } from "~/lib/server/checkout-locale.server"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { resolveViewerAndHeaders } from "~/lib/server/backend-api-auth.server"

async function handleRequest(request: Request, context: ActionFunctionArgs["context"]) {
  const resolved = await resolveViewerAndHeaders(request, context)
  if ("error" in resolved) {
    return resolved.error
  }

  const input = (await request.json().catch(() => ({}))) as { locale?: unknown } | null
  const locale = getCheckoutLocale(request, input?.locale)

  // 契約中のカードを変更する Stripe のページ（カード変更・請求履歴のみ）を開く URL をもらう
  try {
    const apiResponse = await fetch(
      `${resolved.apiBaseUrl}/internal/subscriptions/billing-portal/${resolved.viewer.userId}`,
      {
        method: "POST",
        headers: { ...resolved.headers, "Content-Type": "application/json" },
        // 英語のページから来た人には、Stripe の画面も英語で出す
        body: JSON.stringify({ locale }),
      },
    )
    const responseText = await apiResponse.text()
    const apiJson = (() => {
      try {
        return JSON.parse(responseText) as {
          error: string | null
          data: { url: string } | null
        }
      } catch {
        return null
      }
    })()

    if (!apiResponse.ok || apiJson?.error || !apiJson?.data?.url) {
      return toJsonResponse(
        { error: apiJson?.error ?? "お支払い方法の変更画面を開けませんでした", data: null },
        apiResponse.status === 404 ? 404 : 502,
      )
    }

    return toJsonResponse({ error: null, data: { url: apiJson.data.url } }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "お支払い方法の変更画面を開けませんでした",
        data: null,
      },
      502,
    )
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  return handleRequest(request, context)
}
