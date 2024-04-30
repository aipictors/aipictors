/**
 * ローカルストレージからユーザトークンを取得し、有効期限をチェック
 * @returns トークンの文字列またはnull（有効期限切れまたはトークンなし）
 */
export const getUserToken = () => {
  try {
    return localStorage.getItem("login_user_token")
  } catch (error) {
    console.error("トークンの取得に失敗しました:", error)
    return null
  }
}
