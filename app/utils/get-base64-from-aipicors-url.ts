export const getBase64FromAipictorsUrl = async (
  url: string,
): Promise<string> => {
  const formData = new FormData()

  formData.append("url", url)

  try {
    const endpoint =
      "https://www.aipictors.com/wp-content/themes/AISite/get-base-64.php"

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const responseData = (await response.json()) as any
      if (responseData.base64) {
        return responseData.base64
      }
      return ""
    }
    throw new Error()
  } catch (error) {
    // captureException(error)
    throw new Error()
  }
}
