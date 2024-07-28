import { config } from "~/config"

/**
 * 同じ作品をいいねしたユーザがいいねしたスコアの高い作品ID一覧を取得
 * @param userId 取得対象のユーザID
 * @param workId レコメンドをもとにする作品ID
 * @returns 作品IDの配列
 */
export const getRecommendedWorkIdsByWorkId = async (
  userId: string,
  workId: string,
): Promise<string[]> => {
  const formData = new FormData()

  formData.append("userId", userId)
  formData.append("worksId", workId)

  try {
    const endpoint = config.wordpressEndpoint.getRecommendedWorkIdsByWorkId

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
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
