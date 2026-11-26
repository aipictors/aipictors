import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"

/**
 * 見ている人によって答えが変わる問い合わせを、ログインの確認が終わるまで待たせるか
 * 待たないとログイン中の人は「未ログインとして 1 回 → ログイン後にもう 1 回」と 2 回問い合わせる。
 * HTML の印（data-aip-auth="out"）で未ログインと分かる人は待たずにすぐ問い合わせる
 */
export function useIsWaitingForViewer() {
  const authContext = useContext(AuthContext)
  if (!authContext.isLoading) return false
  if (typeof document === "undefined") return true
  return document.documentElement.dataset.aipAuth !== "out"
}
