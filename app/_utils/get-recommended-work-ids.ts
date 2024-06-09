import { config } from "@/config"

/**
 * 同じ作品をいいねしたユーザがいいねしたスコアの高い作品ID一覧を取得
 * @param userId 取得対象のユーザID
 * @param style 作風
 * @returns 作品IDの配列
 */
export const getRecommendedWorkIds = async (
  userId: string,
  style?: "real" | "semireal" | "illust" | "sensitive",
  type?: "image" | "video" | "column" | "novel",
  rating?: "G" | "R18",
): Promise<string[]> => {
  const formData = new FormData()

  formData.append("id", userId)
  if (style) {
    formData.append("style", style)
  }
  const payload = {
    id: userId,
    ...(style && { style }),
    ...(type && { type }),
    ...(rating && { rating }),
  }

  try {
    const endpoint = config.wordpressEndpoint.getRecommendedIds

    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const responseData = (await response.json()) as { workIds: string[] }
      return responseData.workIds
    }
    throw new Error(
      `Failed to fetch recommended work IDs: ${response.statusText}`,
    )
  } catch (error) {
    console.error("Error fetching recommended work IDs:", error)
    throw error
  }
}
