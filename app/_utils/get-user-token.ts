/**
 * ローカルストレージからユーザトークンを取得し、有効期限をチェック
 * @returns トークンの文字列またはnull（有効期限切れまたはトークンなし）
 */
export const getUserToken = () => {
  try {
    const expiry = localStorage.getItem("token_expiry")
    const now = new Date()

    if (expiry && new Date(expiry) > now) {
      // 有効期限内ならトークンを返す
      return localStorage.getItem("user_token")
    }
    // 有効期限切れならトークンを削除しnullを返す
    localStorage.removeItem("user_token")
    localStorage.removeItem("token_expiry")
    console.log("トークンの有効期限が切れました")
    return null
  } catch (error) {
    console.error("トークンの取得に失敗しました:", error)
    return null
  }
}
