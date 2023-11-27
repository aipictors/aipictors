import { captureException } from "@sentry/nextjs"

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()

  formData.append("file", file)

  try {
    const endpoint = "https://api.aipictors.com/api/v1/files/upload"

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      const responseData = await response.json()
      return responseData.url
    }
    throw new Error()
  } catch (error) {
    captureException(error)
    throw new Error()
  }
}
