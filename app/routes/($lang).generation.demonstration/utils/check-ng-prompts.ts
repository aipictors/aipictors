import { config } from "~/config"

export interface NgWordsResponse {
  hit_words: string
  hit_negative_words: string
}

export const checkNgPrompts = async (
  prompts: string,
  negativePrompts: string,
  modelName: string,
  loginUserId: string,
): Promise<NgWordsResponse> => {
  try {
    const formData = new FormData()

    formData.append("prompts", prompts)
    formData.append("negative", negativePrompts)
    formData.append("model", modelName)
    formData.append("user_id", loginUserId)

    const response = await fetch(config.internalApiEndpoint.promptsCheck, {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const data: NgWordsResponse = await response.json()
      const hitWords = data.hit_words
      const hitNegativeWords = data.hit_negative_words
      return {
        hit_words: hitWords,
        hit_negative_words: hitNegativeWords,
      }
    }

    return {
      hit_words: "",
      hit_negative_words: "",
    }
  } catch (error) {
    console.error("Error during API request:", error)
    return {
      hit_words: "",
      hit_negative_words: "",
    }
  }
}
