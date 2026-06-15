import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { number, object, optional, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import {
  calcBonusCoins,
  calcCustomPriceYen,
  MIN_CUSTOM_COINS,
  PREMIUM_COIN_PACKAGES,
  parsePremiumCoinPackageId,
} from "~/lib/server/premium-coins.server"

const postStripeForm = async (secretKey: string, params: URLSearchParams) => {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  return response.json()
}

const createPremiumCoinCheckoutDirect = async (props: {
  secretKey: string
  origin: string
  userId: string
  coins: number
  bonusCoins: number
  priceYen: number
}) => {
  const coins = Math.max(0, Math.floor(props.coins))
  const bonusCoins = Math.max(0, Math.floor(props.bonusCoins))
  const totalCoins = coins + bonusCoins
  const priceYen = Math.max(0, Math.floor(props.priceYen))

  const params = new URLSearchParams()
  params.set("mode", "payment")
  params.set(
    "success_url",
    `${props.origin}/settings/points?checkout=premium-success&session_id={CHECKOUT_SESSION_ID}`,
  )
  params.set(
    "cancel_url",
    `${props.origin}/settings/points?checkout=premium-cancel`,
  )
  params.set("client_reference_id", props.userId)
  params.set("line_items[0][quantity]", "1")
  params.set("line_items[0][price_data][currency]", "jpy")
  params.set("line_items[0][price_data][unit_amount]", String(priceYen))
  params.set(
    "line_items[0][price_data][product_data][name]",
    `Aipictors Premium Coins ${totalCoins}`,
  )
  params.set("metadata[kind]", "premium_coins")
  params.set("metadata[user_id]", props.userId)
  params.set("metadata[coins]", String(coins))
  params.set("metadata[bonus_coins]", String(bonusCoins))
  params.set("metadata[total_coins]", String(totalCoins))
  params.set("metadata[price_yen]", String(priceYen))
  params.set("payment_intent_data[metadata][kind]", "premium_coins")
  params.set("payment_intent_data[metadata][user_id]", props.userId)
  params.set("payment_intent_data[metadata][coins]", String(coins))
  params.set("payment_intent_data[metadata][bonus_coins]", String(bonusCoins))
  params.set("payment_intent_data[metadata][total_coins]", String(totalCoins))
  params.set("payment_intent_data[metadata][price_yen]", String(priceYen))

  return postStripeForm(props.secretKey, params)
}

const getLocalEnvFileValue = async (key: string) => {
  if (typeof process === "undefined") {
    return null
  }

  try {
    const [{ readFile }, { resolve }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ])

    const envText = await readFile(
      resolve(process.cwd(), "../aipictors-system/.env"),
      "utf8",
    )

    const line = envText
      .split(/\r?\n/u)
      .find((entry) => entry.startsWith(`${key}=`))

    if (!line) {
      return null
    }

    const value = line.slice(key.length + 1).trim()
    return value.replace(/^['"]|['"]$/gu, "") || null
  } catch {
    return null
  }
}

const getStripeSecretKey = async (context: ActionFunctionArgs["context"]) => {
  return (
    getServerEnvValue(context, "STRIPE_SECRET_KEY") ??
    (await getLocalEnvFileValue("STRIPE_SECRET_KEY"))
  )
}

const bodySchema = object({
  packageId: string(),
  customCoins: optional(number()),
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
  const wpUserId = request.headers.get("wp-user-id")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!graphqlEndpoint) {
    return toJsonResponse(
      { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
      500,
    )
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: wpUserId ?? undefined,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const parsedBody = safeParse(bodySchema, await request.json())
  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  const packageId = parsePremiumCoinPackageId(parsedBody.output.packageId)
  if (!packageId) {
    return toJsonResponse({ error: "Invalid packageId", data: null }, 400)
  }

  let coins: number
  let bonusCoins: number
  let priceYen: number

  if (packageId === "PREMIUM_COINS_CUSTOM") {
    const customCoins = parsedBody.output.customCoins
    if (
      typeof customCoins !== "number" ||
      !Number.isInteger(customCoins) ||
      customCoins < MIN_CUSTOM_COINS
    ) {
      return toJsonResponse(
        {
          error: `customCoins must be an integer >= ${MIN_CUSTOM_COINS}`,
          data: null,
        },
        400,
      )
    }
    coins = customCoins
    bonusCoins = calcBonusCoins(customCoins)
    priceYen = calcCustomPriceYen(customCoins)
  } else {
    const pkg = PREMIUM_COIN_PACKAGES[packageId]
    coins = pkg.coins
    bonusCoins = pkg.bonusCoins
    priceYen = pkg.priceYen
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken =
    getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN") ??
    getServerEnvValue(context, "INTERNAL_API_TOKEN")
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

  const requestUrl = new URL(request.url)
  const appOrigin = `${requestUrl.protocol}//${requestUrl.host}`
  const stripeSecretKey = await getStripeSecretKey(context)

  if (stripeSecretKey && appOrigin.includes("localhost")) {
    const directCheckoutJson = (await createPremiumCoinCheckoutDirect({
      secretKey: stripeSecretKey,
      origin: appOrigin,
      userId: viewer.userId,
      coins,
      bonusCoins,
      priceYen,
    })) as {
      url?: string
      error?: { message?: string }
    }

    if (directCheckoutJson.url) {
      return toJsonResponse(
        {
          error: null,
          data: {
            checkoutUrl: directCheckoutJson.url,
            coins,
            bonusCoins,
            totalCoins: coins + bonusCoins,
            priceYen,
          },
        },
        200,
      )
    }

    return toJsonResponse(
      {
        error:
          directCheckoutJson.error?.message ??
          "Failed to create Stripe checkout session",
        data: null,
      },
      502,
    )
  }

  const apiResponse = await fetch(
    `${apiBaseUrl}/stripe/checkout/premium-coins`,
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
        coins,
        bonusCoins,
        priceYen,
        origin: appOrigin,
      }),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: { url?: string }
  }

  let checkoutUrl = apiJson.data?.url

  if (
    (!apiResponse.ok || apiJson.error || !checkoutUrl) &&
    apiResponse.status === 404 &&
    apiJson.error === "Not found"
  ) {
    const stripeSecretKey = await getStripeSecretKey(context)

    if (stripeSecretKey) {
      const directCheckoutJson = (await createPremiumCoinCheckoutDirect({
        secretKey: stripeSecretKey,
        origin: appOrigin,
        userId: viewer.userId,
        coins,
        bonusCoins,
        priceYen,
      })) as {
        url?: string
        error?: { message?: string }
      }

      if (directCheckoutJson.url) {
        checkoutUrl = directCheckoutJson.url
      } else {
        return toJsonResponse(
          {
            error:
              directCheckoutJson.error?.message ??
              "Failed to create Stripe checkout session",
            data: null,
          },
          502,
        )
      }
    }
  }

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
        coins,
        bonusCoins,
        totalCoins: coins + bonusCoins,
        priceYen,
      },
    },
    200,
  )
}
