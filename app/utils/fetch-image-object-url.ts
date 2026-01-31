/**
 * 画像を取得する
 * @param imageURL 画像のURL
 * @param token トークン
 */
export const fetchImage: (imageURL: string) => Promise<string> = async (
  imageURL: string,
): Promise<string> => {
  try {
    const res = await fetch(imageURL, {
      mode: "cors",
      priority: "high",
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // },
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
