/**
 * ユーザIDのトークンをローカルストレージに保存
 */
export const setUserToken: (token: string) => void = (token: string): void => {
  try {
    localStorage.setItem("login_user_token", token)
  } catch (error) {
    console.error("トークンの保存に失敗しました:", error)
  }
}
