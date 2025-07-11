import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages"
// @ts-ignore - the server build file is generated by `remix vite:build`
import * as build from "../build/server"

const remix = createPagesFunctionHandler({
  build,
})

export const onRequest: PagesFunction = async (ctx) => {
  const maxRetry = 3
  const baseDelay = 200 // 基本遅延時間（ミリ秒）
  const maxDelay = 5000 // 最大遅延時間（ミリ秒）
  const timeoutMs = 30000 // 30秒のタイムアウト

  /**
   * Error 1101やDB接続エラーを検出する
   */
  const isRetryableError = (error: unknown): boolean => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return (
      errorMessage.includes("1101") ||
      errorMessage.includes("Worker threw exception") ||
      errorMessage.includes("database") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("connection")
    )
  }

  /**
   * タイムアウト付きでリクエストを実行する
   */
  const executeWithTimeout = async (
    request: Promise<Response>,
  ): Promise<Response> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    })

    return Promise.race([request, timeoutPromise])
  }

  for (let attempt = 0; attempt < maxRetry; attempt++) {
    try {
      const res = await executeWithTimeout(remix(ctx))

      if (res.body) {
        const text = await res.text()
        return new Response(text, res)
      }
      return res
    } catch (err) {
      console.error(`Request attempt ${attempt + 1}/${maxRetry} failed:`, err)

      // リトライ可能なエラーかどうかを判定
      if (!isRetryableError(err)) {
        // リトライ不可能なエラーの場合は即座にエラーを返す
        return new Response(
          JSON.stringify({
            error: "Internal server error",
            code: "INTERNAL_ERROR",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }

      // 最後の試行の場合はエラーを返す
      if (attempt === maxRetry - 1) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable. Please try again later.",
            code: "TEMPORARY_UNAVAILABLE",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "30",
            },
          },
        )
      }

      // 指数バックオフで遅延時間を増加させる
      const delay = Math.min(baseDelay * 2 ** attempt, maxDelay)
      // ジッターを追加して同時リクエストの集中を防ぐ
      const jitter = Math.random() * 0.3 * delay
      const actualDelay = delay + jitter

      console.log(`Retrying in ${Math.round(actualDelay)}ms...`)
      await new Promise((resolve) => setTimeout(resolve, actualDelay))
    }
  }

  // この行に到達することはないが、TypeScriptの型チェックのために残す
  return new Response("Unexpected error", { status: 500 })
}
