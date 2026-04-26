import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import {
  addPointsTransaction,
  ensurePointsSchema,
  hasStripeEventProcessed,
} from "~/lib/server/points-d1.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import {
  parsePointsPackageId,
  resolvePointsPackageMap,
  verifyStripeWebhookSignature,
} from "~/lib/server/stripe-points.server"

type StripeEvent = {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
  }
}

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

const parseStringField = (obj: Record<string, unknown>, key: string) => {
  const value = obj[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

const resolvePointsFromMetadata = (props: {
  metadata: Record<string, unknown>
  packageMap: ReturnType<typeof resolvePointsPackageMap>
}) => {
  const pointsText = parseStringField(props.metadata, "points")
  if (pointsText) {
    const parsed = Number.parseInt(pointsText, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }

  const packageId = parsePointsPackageId(props.metadata.package_id)
  if (!packageId) {
    return null
  }

  return props.packageMap[packageId].points
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed" }, 405)
  }

  const db = (context as { cloudflare?: { env?: { POINTS_DB?: D1Database } } })
    .cloudflare?.env?.POINTS_DB

  if (!db) {
    return toJsonResponse({ error: "POINTS_DB is not configured" }, 500)
  }

  const webhookSecret = getServerEnvValue(context, "STRIPE_POINTS_WEBHOOK_SECRET")
  if (!webhookSecret) {
    return toJsonResponse({ error: "Webhook secret is not configured" }, 500)
  }

  const signatureHeader = request.headers.get("stripe-signature")
  if (!signatureHeader) {
    return toJsonResponse({ error: "Missing stripe-signature" }, 400)
  }

  const payload = await request.text()

  const isValidSignature = await verifyStripeWebhookSignature({
    payload,
    signatureHeader,
    webhookSecret,
  })

  if (!isValidSignature) {
    return toJsonResponse({ error: "Invalid signature" }, 401)
  }

  const event = JSON.parse(payload) as StripeEvent

  if (!event.id || !event.type) {
    return toJsonResponse({ error: "Invalid event payload" }, 400)
  }

  await ensurePointsSchema(db)

  const isProcessed = await hasStripeEventProcessed({
    db,
    stripeEventId: event.id,
  })

  if (isProcessed) {
    return toJsonResponse({ received: true, deduplicated: true }, 200)
  }

  const packageMap = resolvePointsPackageMap({
    price100: getServerEnvValue(context, "STRIPE_POINTS_PRICE_100"),
    price300: getServerEnvValue(context, "STRIPE_POINTS_PRICE_300"),
    price1000: getServerEnvValue(context, "STRIPE_POINTS_PRICE_1000"),
  })

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const mode = parseStringField(session, "mode")
    const paymentStatus = parseStringField(session, "payment_status")
    const sessionId = parseStringField(session, "id")
    const metadata =
      typeof session.metadata === "object" && session.metadata !== null
        ? (session.metadata as Record<string, unknown>)
        : {}

    if (mode !== "payment" || paymentStatus !== "paid") {
      return toJsonResponse({ received: true, ignored: true }, 200)
    }

    const userId = parseStringField(metadata, "user_id")
    const points = resolvePointsFromMetadata({ metadata, packageMap })

    if (!userId || !points) {
      return toJsonResponse({ received: true, ignored: true }, 200)
    }

    await addPointsTransaction({
      db,
      userId,
      delta: points,
      kind: "PURCHASE",
      reason: "Stripe checkout completed",
      stripeEventId: event.id,
      stripeSessionId: sessionId,
    })

    return toJsonResponse({ received: true }, 200)
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object
    const metadata =
      typeof charge.metadata === "object" && charge.metadata !== null
        ? (charge.metadata as Record<string, unknown>)
        : {}
    const userId = parseStringField(metadata, "user_id")
    const points = resolvePointsFromMetadata({ metadata, packageMap })

    if (!userId || !points) {
      return toJsonResponse({ received: true, ignored: true }, 200)
    }

    await addPointsTransaction({
      db,
      userId,
      delta: -points,
      kind: "REFUND_REVOKE",
      reason: "Stripe refund",
      stripeEventId: event.id,
      stripeSessionId: parseStringField(charge, "payment_intent"),
    })

    return toJsonResponse({ received: true }, 200)
  }

  return toJsonResponse({ received: true, ignored: true }, 200)
}
