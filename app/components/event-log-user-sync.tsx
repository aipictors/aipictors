import { useContext, useEffect } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { setEventLogUser } from "~/utils/event-log"

/**
 * 操作の記録（app/utils/event-log.ts）に、ログイン中のユーザーを伝える（保存はサーバーでハッシュにしてから）
 */
export function EventLogUserSync(): null {
  const authContext = useContext(AuthContext)
  const userId = authContext.isLoggedIn ? authContext.userId : null

  useEffect(() => {
    if (authContext.isLoading) return
    setEventLogUser(userId)
  }, [authContext.isLoading, userId])

  return null
}
