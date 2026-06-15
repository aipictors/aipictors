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

export const getViewerRequestHeaders = async (props?: {
  includeJsonContentType?: boolean
}) => {
  const headers: Record<string, string> = {}

  if (props?.includeJsonContentType) {
    headers["content-type"] = "application/json"
  }

  const currentUser = getCurrentFirebaseUser()
  if (currentUser) {
    const token = await getIdToken(currentUser)
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