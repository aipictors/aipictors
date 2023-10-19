export async function uploadFile(file: File): Promise<string> {
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
      const url = responseData.url
      return url
    } else {
      throw new Error()
    }
  } catch (error) {
    throw new Error()
  }
}
