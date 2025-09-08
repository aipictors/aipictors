// filepath: app/lib/redact-diagnostics.ts
// 診断ログ向け: 機密情報を含む可能性のある値を再帰的にマスキングする純粋関数

export type Redacted = unknown

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

const redactString = (text: string): string => {
  // data URL(Base64)は長さのみ残す
  if (text.startsWith("data:") && text.includes(";base64,")) {
    const type = text.slice(5, text.indexOf(";base64,"))
    const base64 = text.slice(text.indexOf(",") + 1)
    return `data:${type};base64,<redacted length=${base64.length}>`
  }

  // JWTらしき文字列を置換(3セグメント、Base64URL風)
  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(text)) {
    return "<jwt:redacted>"
  }

  // 長大なBase64風文字列は省略
  if (text.length > 256 && /^[A-Za-z0-9+/=]+$/.test(text)) {
    return `<base64:redacted length=${text.length}>`
  }

  // メールアドレスのローカル部をマスク
  const maskedEmail = text.replace(
    /([A-Za-z0-9._%+-])([A-Za-z0-9._%+-]*)(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
    (_m, a1: string, a2: string, a3: string) => {
      return `${a1}${a2 ? "***" : ""}${a3}`
    },
  )

  // URLのクエリ・フラグメントを除去
  try {
    const url = new URL(maskedEmail)
    url.search = ""
    url.hash = ""
    return url.toString()
  } catch {
    // URLでなければマスク済みの文字列を返す
  }

  return maskedEmail
}

/**
 * 値を再帰的にマスキングする
 */
export const redactDiagnostics = (value: unknown): Redacted => {
  // 原始型
  if (value === null) return null
  if (typeof value === "undefined") return undefined
  if (typeof value === "number" || typeof value === "boolean") return value

  // 文字列
  if (typeof value === "string") return redactString(value)

  // 配列
  if (Array.isArray(value)) {
    const redacted: unknown[] = []
    for (const item of value) {
      redacted.push(redactDiagnostics(item))
    }
    return redacted
  }

  // オブジェクト
  if (isRecord(value)) {
    const output: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      const lower = key.toLowerCase()
      if (
        lower.includes("authorization") ||
        lower.includes("cookie") ||
        lower.includes("token") ||
        lower.includes("secret") ||
        lower.includes("password")
      ) {
        output[key] = "<redacted>"
        continue
      }
      output[key] = redactDiagnostics(value[key])
    }
    return output
  }

  // その他は可能ならシリアライズ、ダメなら文字列化
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return String(value)
  }
}
