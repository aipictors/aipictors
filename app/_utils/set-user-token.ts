/**
 * ユーザIDのトークンをローカルストレージに保存し、有効期限を設定
 * @param token 保存するユーザトークン
 */
export const setUserToken = (token: string) => {
  try {
    const now = new Date()
    const expiryDate = new Date(now.getTime() + 60 * 60 * 24 * 6) // JWTの有効期限は7日だが安全を取って6日間にする

    // ローカルストレージにトークンと有効期限を保存
    localStorage.setItem("user_token", token)
    localStorage.setItem("token_expiry", expiryDate.toString())

    console.log("トークンが保存されました")
  } catch (error) {
    console.error("トークンの保存に失敗しました:", error)
    return null
  }
}
