/**
 * Cookie情報取得
 */
export const setCookie = (name: string, value: number) => {
  document.cookie = `${name}=${value}; path=/`
}
