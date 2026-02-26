type TranslateTextParams = {
  text: string
  sourceLanguage?: string
  targetLanguage: string
}

const GOOGLE_APPS_SCRIPT_TRANSLATE_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbw1D0NqYxBiJvN00CZLCnoDIpWtK_cib_JDY7sva_Mlwr-XVjabRSWDooBBvVlgZUPU/exec"

export async function translateText(
  params: TranslateTextParams,
): Promise<string> {
  const query = new URLSearchParams({
    text: params.text,
    target: params.targetLanguage,
  })

  // Google Apps Script 側で source="auto" が弾かれる場合があるため、
  // 自動判定は source を省略して扱う。
  if (params.sourceLanguage && params.sourceLanguage !== "auto") {
    query.set("source", params.sourceLanguage)
  }

  const translateURL = `${GOOGLE_APPS_SCRIPT_TRANSLATE_ENDPOINT}?${query.toString()}`

  const response = await fetch(translateURL)
  if (!response.ok) return ""

  let data: unknown
  try {
    data = await response.json()
  } catch {
    return ""
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "text" in data &&
    typeof (data as { text: unknown }).text === "string"
  ) {
    return (data as { text: string }).text
  }

  return ""
}
