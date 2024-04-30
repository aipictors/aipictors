/**
 * ユーザIDのトークンをローカルストレージに保存し、有効期限を設定
 * @param token 保存するユーザトークン
 */
export const setUserToken = (token: string) => {
  try {
    localStorage.setItem("login_user_token", token)
  } catch (error) {
    console.error("トークンの保存に失敗しました:", error)
    return null
  }
}
