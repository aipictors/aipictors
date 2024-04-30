/**
 * ユーザIDのトークンを取得
 * @returns
 */
export const setUserToken = (token: string) => {
  try {
    // Cookieに保存（10分間有効）
    const expiryDate = new Date()
    expiryDate.setMinutes(expiryDate.getMinutes() + 10)
    document.cookie = `user_token=${token}; expires=${expiryDate.toString()}; path=/`
  } catch (error) {
    return null
  }
}
