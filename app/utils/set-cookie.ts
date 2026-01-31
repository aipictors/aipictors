/**
 * Cookie情報取得
 */
export const setCookie: (name: string, value: number) => void = (
  name: string,
  value: number,
): void => {
  document.cookie = `${name}=${value}; path=/`
}
