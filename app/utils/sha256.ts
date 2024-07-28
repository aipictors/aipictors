/**
 * sha256でハッシュ化
 * @param data データ
 * @returns ハッシュ値
 */
export const sha256 = async (data: string): Promise<string> => {
  // エンコードされたメッセージのバッファを取得
  const msgBuffer = new TextEncoder().encode(data)

  // SHA-256でハッシュ化されたメッセージのバッファを取得
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)

  // バッファを16進数文字列に変換
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}
