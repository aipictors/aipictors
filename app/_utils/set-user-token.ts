/**
 * ユーザIDのトークンをローカルストレージに保存
 */
export const setUserToken = (token: string) => {
  try {
    localStorage.setItem("login_user_token", token)
  } catch (error) {
    console.error("トークンの保存に失敗しました:", error)
    return null
  }
}
