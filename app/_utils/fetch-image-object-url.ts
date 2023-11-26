/**
 * 画像を取得する
 * @param imageURL 画像のURL
 * @param token トークン
 * @returns
 */
export const fetchImage = async (imageURL: string, token: string) => {
  try {
    const res = await fetch(imageURL, {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("画像の取得に失敗しました")
  }
}
