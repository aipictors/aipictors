import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { object, safeParse, string, union, literal } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const bodySchema = object({
  passType: union([literal("LITE"), literal("STANDARD"), literal("PREMIUM")]),
  currentPassType: string(),
})

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
  if (!graphqlEndpoint) {
    return toJsonResponse(
      { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
      500,
    )
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const requestText = await request.text()
  const parsedRequestBody = (() => {
    if (!requestText) {
      return null
    }
    try {
      return JSON.parse(requestText) as unknown
    } catch {
      return null
    }
  })()

  const parsedBody = safeParse(bodySchema, parsedRequestBody)
  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  if (parsedBody.output.passType === parsedBody.output.currentPassType) {
    return toJsonResponse(
      { error: "現在のプランと同じです", data: null },
      400,
    )
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN")
  const cfAccessClientId = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
  )
  const cfAccessClientSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  try {
    const apiResponse = await fetch(
      `${apiBaseUrl}/internal/subscriptions/change-plan`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${internalToken}`,
          "Content-Type": "application/json",
          ...(cfAccessClientId && cfAccessClientSecret
            ? {
                "CF-Access-Client-Id": cfAccessClientId,
                "CF-Access-Client-Secret": cfAccessClientSecret,
              }
            : {}),
        },
        body: JSON.stringify({
          userId: viewer.userId,
          passType: parsedBody.output.passType,
        }),
      },
    )

    const responseText = await apiResponse.text()
    const apiJson = (() => {
      if (!responseText) {
        return null
      }
      try {
        return JSON.parse(responseText) as {
          error: string | null
          data: {
            passType: string
            amountJpy: number
            status: string
          } | null
        }
      } catch {
        return null
      }
    })()

    if (!apiResponse.ok || apiJson?.error) {
      const fallbackError =
        responseText && !responseText.trim().startsWith("<")
          ? responseText
          : "Failed to change plan"
      console.error("subscription-change-plan upstream error", {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: apiJson?.error ?? fallbackError,
      })
      return toJsonResponse(
        {
          error: apiJson?.error ?? fallbackError,
          data: null,
        },
        502,
      )
    }

    return toJsonResponse(
      {
        error: null,
        data: {
          passType: apiJson?.data?.passType ?? parsedBody.output.passType,
          amountJpy: apiJson?.data?.amountJpy ?? null,
        },
      },
      200,
    )
  } catch (error) {
    return toJsonResponse(
      {
        error: error instanceof Error ? error.message : "Failed to change plan",
        data: null,
      },
      502,
    )
  }
}
