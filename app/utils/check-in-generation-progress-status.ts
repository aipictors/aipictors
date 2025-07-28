import { config } from "~/config"

/**
 * 自身の生成状況をチェックして一覧を再フェッチするかどうか確認する
 */
export const checkInGenerationProgressStatus = async (
  userId: string,
  inProgressImageGenerationTasksCount: string,
  imageGenerationWaitCount: string,
): Promise<boolean> => {
  const formData = new FormData()

  formData.append("userId", userId)
  formData.append(
    "inProgressImageGenerationTasksCount",
    inProgressImageGenerationTasksCount,
  )
  formData.append("imageGenerationWaitCount", imageGenerationWaitCount)

  try {
    const endpoint = config.wordpressEndpoint.generationCheck

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const responseData = (await response.json()) as any
      if (responseData.needRefetch === "true") {
        return true
      }
      return false
    }
    throw new Error()
  } catch (_error) {
    // captureException(error)
    throw new Error()
  }
}
