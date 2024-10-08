/**
 * ローカルストレージからユーザトークンを取得
 */
export function getUserToken() {
  try {
    return localStorage.getItem("login_user_token")
  } catch (error) {
    console.error("トークンの取得に失敗しました:", error)
    return null
  }
}
