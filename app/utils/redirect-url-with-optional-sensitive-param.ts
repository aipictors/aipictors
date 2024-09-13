import { redirect } from "@remix-run/cloudflare"

/**
 * 指定したURLに応じて、必要に応じてリダイレクトを行う
 * @param request - RemixのRequestオブジェクト
 * @param redirectUrl - リダイレクト先のURL（相対パス可）
 * @returns リダイレクトオブジェクトまたはundefined
 */
export const redirectUrlWithOptionalSensitiveParam = (
  request: Request,
  redirectUrl: string,
) => {
  // Cookieから"sensitive"フラグを取得
  const cookieHeader = request.headers.get("Cookie")
  const cookies = new Map(
    cookieHeader
      ?.split(";")
      .map(
        (cookie) =>
          cookie.trim().split("=") as unknown as readonly [unknown, unknown],
      ) || [],
  )
  const sensitiveCookie = cookies.get("sensitive")

  // Cookieで "sensitive=1" が含まれている場合
  if (sensitiveCookie === "1") {
    const url = new URL(request.url) // 現在のURLを取得
    const baseUrl = url.origin // ベースURL (例: https://example.com)
    const redirectUrlObj = new URL(redirectUrl, baseUrl) // 相対パスを絶対パスに変換
    return redirect(redirectUrlObj.toString())
  }

  // "sensitive=1" が含まれていない場合は何もせず undefined を返す
  return undefined
}
