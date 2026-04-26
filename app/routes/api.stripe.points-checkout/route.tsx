import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { object, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { parsePointsPackageId } from "~/lib/server/stripe-points.server"

const bodySchema = object({
  packageId: string(),
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

  const parsedBody = safeParse(bodySchema, await request.json())
  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  const packageId = parsePointsPackageId(parsedBody.output.packageId)
  if (!packageId) {
    return toJsonResponse({ error: "Invalid packageId", data: null }, 400)
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

  const pointsByPackageId = {
    POINTS_100: 100,
    POINTS_300: 300,
    POINTS_1000: 1000,
  } as const

  const points = pointsByPackageId[packageId]

  const requestUrl = new URL(request.url)
  const appOrigin = `${requestUrl.protocol}//${requestUrl.host}`

  const apiResponse = await fetch(`${apiBaseUrl}/stripe/checkout/points`, {
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
      points,
      origin: appOrigin,
    }),
  })

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: {
      url?: string
    }
  }

  const checkoutUrl = apiJson.data?.url

  if (!apiResponse.ok || apiJson.error || !checkoutUrl) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to create Stripe checkout session",
        data: null,
      },
      502,
    )
  }

  return toJsonResponse(
    {
      error: null,
      data: {
        checkoutUrl,
        sessionId: null,
      },
    },
    200,
  )
}
