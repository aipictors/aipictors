import { getReferralDeviceId } from "~/lib/referral/referral-storage"

/**
 * 生成の依頼に付ける端末の目印（ヘッダー x-aipictors-device: v1.<端末 ID>.<特徴のハッシュ>）
 *
 * 同じ端末で複数アカウントを使って無料枠で生成していないかを調べるため（サーバーは今は記録だけ）。
 * - 端末 ID: localStorage の ID（紹介特典と同じもの）
 * - 特徴のハッシュ: 画面・タイムゾーン・言語・GPU・canvas の描画などから作る。シークレットウィンドウでも変わりにくい
 * どちらも個人を特定する値は含まない
 */

export const DEVICE_SIGNAL_HEADER = "x-aipictors-device"

/** 端末の目印を付ける問い合わせ（生成の依頼） */
const SIGNAL_OPERATIONS = new Set([
  "CreateImageGenerationTask",
  "CreateReservedImageGenerationTask",
  "CreateFluxImageGenerationTask",
  "CreateGeminiImageGenerationTask",
])

export const shouldAttachDeviceSignal = (operationName: string | undefined) =>
  operationName !== undefined && SIGNAL_OPERATIONS.has(operationName)

const canvasSample = () => {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = 220
    canvas.height = 30
    const ctx = canvas.getContext("2d")
    if (ctx === null) return ""
    ctx.textBaseline = "top"
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = "#f60"
    ctx.fillRect(100, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText("Aipictors 端末 😺", 2, 2)
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
    ctx.fillText("Aipictors 端末 😺", 4, 4)
    return canvas.toDataURL()
  } catch {
    return ""
  }
}

const webglRenderer = () => {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl")
    if (gl === null) return ""
    const info = gl.getExtension("WEBGL_debug_renderer_info")
    if (info === null) return String(gl.getParameter(gl.RENDERER))
    return `${gl.getParameter(info.UNMASKED_VENDOR_WEBGL)}|${gl.getParameter(info.UNMASKED_RENDERER_WEBGL)}`
  } catch {
    return ""
  }
}

const collectTraits = () => {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return [
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(window.devicePixelRatio),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    (nav.languages ?? [nav.language]).join(","),
    nav.platform,
    String(nav.hardwareConcurrency ?? ""),
    String(nav.deviceMemory ?? ""),
    String(nav.maxTouchPoints ?? ""),
    webglRenderer(),
    canvasSample(),
  ].join("\n")
}

const sha256Hex = async (text: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  )
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

let fingerprintPromise: Promise<string | null> | null = null

const getFingerprint = () => {
  if (fingerprintPromise === null) {
    fingerprintPromise = sha256Hex(collectTraits())
      .then((hex) => hex.slice(0, 32))
      .catch(() => null)
  }
  return fingerprintPromise
}

/** ヘッダーの値。作れなければ null（そのときは付けない） */
export const getDeviceSignal = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null
  try {
    const deviceId = getReferralDeviceId()
    const fingerprint = await getFingerprint()
    if (deviceId === null || fingerprint === null) return null
    return `v1.${deviceId}.${fingerprint}`
  } catch {
    return null
  }
}
