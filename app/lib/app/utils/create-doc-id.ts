/**
 * 20文字のランダムな文字列を生成する
 */
export function createDocId(): string {
  const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  let value = ""

  for (let i = 0; i < 20; i++) {
    value += text.charAt(Math.floor(Math.random() * text.length))
  }

  return value
}
