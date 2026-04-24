export type PointsPackageId = "POINTS_100" | "POINTS_300" | "POINTS_1000"

export type PointsPackage = {
	id: PointsPackageId
	points: number
	priceId: string
}

const encoder = new TextEncoder()

const toHex = (bytes: Uint8Array) =>
	[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")

const timingSafeEqualHex = (a: string, b: string) => {
	if (a.length !== b.length) {
		return false
	}

	let diff = 0
	for (let i = 0; i < a.length; i += 1) {
		diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
	}

	return diff === 0
}

const signPayload = async (secret: string, payload: string) => {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	)

	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload))
	return toHex(new Uint8Array(signature))
}

export const verifyStripeWebhookSignature = async (props: {
	payload: string
	signatureHeader: string
	webhookSecret: string
	toleranceSeconds?: number
}) => {
	const toleranceSeconds = props.toleranceSeconds ?? 300

	const items = props.signatureHeader.split(",").map((value) => value.trim())

	const timestamp = items
		.find((value) => value.startsWith("t="))
		?.slice(2)
		.trim()

	const signatures = items
		.filter((value) => value.startsWith("v1="))
		.map((value) => value.slice(3).trim())
		.filter((value) => value.length > 0)

	if (!timestamp || signatures.length === 0) {
		return false
	}

	const timestampInt = Number.parseInt(timestamp, 10)

	if (!Number.isFinite(timestampInt)) {
		return false
	}

	const now = Math.floor(Date.now() / 1000)
	if (Math.abs(now - timestampInt) > toleranceSeconds) {
		return false
	}

	const signedPayload = `${timestamp}.${props.payload}`
	const expected = await signPayload(props.webhookSecret, signedPayload)

	return signatures.some((value) => timingSafeEqualHex(value, expected))
}

export const resolvePointsPackageMap = (props: {
	price100: string | null
	price300: string | null
	price1000: string | null
}) => {
	const map: Record<PointsPackageId, PointsPackage> = {
		POINTS_100: {
			id: "POINTS_100",
			points: 100,
			priceId: props.price100 ?? "",
		},
		POINTS_300: {
			id: "POINTS_300",
			points: 300,
			priceId: props.price300 ?? "",
		},
		POINTS_1000: {
			id: "POINTS_1000",
			points: 1000,
			priceId: props.price1000 ?? "",
		},
	}

	return map
}

export const parsePointsPackageId = (value: unknown): PointsPackageId | null => {
	if (value === "POINTS_100") return "POINTS_100"
	if (value === "POINTS_300") return "POINTS_300"
	if (value === "POINTS_1000") return "POINTS_1000"
	return null
}
