import { getAuth, getIdToken } from "firebase/auth"

const DEV_LOGIN_STORAGE_KEY = "aipictors.devLoginUserId"

const getDevWordPressApiKey = () => {
  const value = (import.meta.env as Record<string, string | undefined>)
    .VITE_DEV_WORDPRESS_API_KEY

  if (typeof value !== "string") {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export const getDevLoginUserId = () => {
  if (typeof window === "undefined") {
    return null
  }

  const value = window.localStorage.getItem(DEV_LOGIN_STORAGE_KEY)?.trim() ?? ""
  return value.length > 0 ? value : null
}

const getCurrentFirebaseUser = () => {
  try {
    return getAuth().currentUser
  } catch {
    return null
  }
}

export const hasViewerRequestSession = () => {
  return getCurrentFirebaseUser() !== null || getDevLoginUserId() !== null
}

/** 今のログインを見分ける ID（端末に保存する値の持ち主の確認用） */
export const getViewerRequestSessionId = () => {
  return getCurrentFirebaseUser()?.uid ?? getDevLoginUserId()
}

export const getViewerRequestHeaders = async (props?: {
  includeJsonContentType?: boolean
  /** ログインのトークンを取り直す（401 が返ったあとのやり直し用） */
  forceRefresh?: boolean
}) => {
  const headers: Record<string, string> = {}

  if (props?.includeJsonContentType) {
    headers["content-type"] = "application/json"
  }

  const currentUser = getCurrentFirebaseUser()
  if (currentUser) {
    const token = await getIdToken(currentUser, props?.forceRefresh === true)
    headers.authorization = `Bearer ${token}`
    return headers
  }

  const devLoginUserId = getDevLoginUserId()
  const devWordPressApiKey = getDevWordPressApiKey()

  if (import.meta.env.DEV && devLoginUserId && devWordPressApiKey) {
    headers.authorization = `Bearer ${devWordPressApiKey}`
    headers["wp-user-id"] = devLoginUserId
    return headers
  }

  throw new Error("Login required")
}

/**
 * ログイン中の人として POST する。401 が返ったら、トークンを取り直してもう一度だけ送る
 * （トークンの期限切れ・確認の一時的な失敗で、決済のボタンが効かないことがあった）
 */
export const postAsViewer = async (url: string, body: unknown) => {
  const send = async (forceRefresh: boolean) =>
    fetch(url, {
      method: "POST",
      headers: await getViewerRequestHeaders({
        includeJsonContentType: true,
        forceRefresh,
      }),
      body: JSON.stringify(body),
    })
  const response = await send(false)
  return response.status === 401 ? send(true) : response
}
