/**
 * ローカルストレージからユーザトークンを取得し、有効期限をチェック
 * @returns トークンの文字列またはnull（有効期限切れまたはトークンなし）
 */
export const getUserToken = () => {
  try {
    const expiry = localStorage.getItem("login_token_expiry")
    const now = new Date()

    if (expiry && new Date(expiry) > now) {
      // 有効期限内ならトークンを返す
      return localStorage.getItem("login_user_token")
    }
    // 有効期限切れならトークンを削除しnullを返す
    localStorage.removeItem("login_user_token")
    localStorage.removeItem("login_token_expiry")
    console.log("トークンの有効期限が切れました")
    return null
  } catch (error) {
    console.error("トークンの取得に失敗しました:", error)
    return null
  }
}
