import { useContext, useEffect } from "react"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { logoutFirebase } from "~/utils/auth-session-backup"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"

/**
 * 自動ログアウトフォーム
 */
export function AutoLogoutForm() {
  const authContext = useContext(AuthContext)

  const handleLogout = async () => {
    await logoutFirebase()
    resetCookieLoginToken()
    moveTop()
  }

  const moveTop = () => {
    const linkNode = document.createElement("a")
    linkNode.href = config.wordpressLink.top
    linkNode.click()
  }

  useEffect(() => {
    if (typeof document === "undefined") return
    handleLogout()
  }, [])

  return (
    <div className="w-full text-center">
      {authContext.isNotLoggedIn
        ? "ログアウト済みです、数秒後にトップページへ遷移します"
        : "ログアウトします、数秒後にトップページへ遷移します"}
    </div>
  )
}
