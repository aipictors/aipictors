/**
 * Cookieのログイン情報を削除する
 */
export const resetCookieLoginToken = () => {
  // Cookieのexpires属性を1970-01-01T00:00:00Zに設定することで削除する
  document.cookie = "wordpress.login_token=; max-age=0; domain=.aipictors.com;"
}
