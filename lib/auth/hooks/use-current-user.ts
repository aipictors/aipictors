import { AuthContext } from "@/lib/auth/contexts/auth-context"
import { useContext } from "react"

/**
 * ログイン中のユーザの情報を取得する
 */
export function useCurrentUser() {
  const context = useContext(AuthContext)

  return context
}
