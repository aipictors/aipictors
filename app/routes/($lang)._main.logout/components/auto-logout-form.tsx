import { AuthContext } from "~/contexts/auth-context"
import { resetCookieLoginToken } from "~/utils/reset-cookie-login-token"
import { config } from "~/config"
import { getAuth, signOut } from "firebase/auth"
import { useContext, useEffect } from "react"

/**
 * 自動ログアウトフォーム
 */
export const AutoLogoutForm = () => {
  const authContext = useContext(AuthContext)

  const handleLogout = async () => {
    await signOut(getAuth())
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
