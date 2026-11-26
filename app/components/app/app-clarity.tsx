import { useLocation } from "@remix-run/react"
import { useContext, useEffect } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { runAfterLoadIdle } from "~/utils/run-after-load-idle"

/**
 * Microsoft Clarity のプロジェクト ID（.env の VITE_CLARITY_PROJECT_ID）。空なら読み込まない
 */
const CLARITY_PROJECT_ID: string = import.meta.env.VITE_CLARITY_PROJECT_ID ?? ""

/**
 * 録画・ヒートマップに入れないページ（アプリ内で開くページは審査に影響するため、管理画面は他の人の情報が出るため）
 */
const EXCLUDED_PATH = /^\/(?:[a-z]{2}\/)?(?:app|flutter|admin)(?:[/.]|$)/

type ClarityQueue = ((...args: unknown[]) => void) & { q?: unknown[][] }

/**
 * 公式の読み込みコードと同じく、読み込み前の呼び出しは q にためておく（読み込み後に Clarity が処理する）
 */
function installClarityQueue() {
  if (window.clarity) return
  const queue: ClarityQueue = (...args: unknown[]) => {
    queue.q = queue.q ?? []
    queue.q.push(args)
  }
  window.clarity = queue
}

let isStarted = false

/**
 * どこを操作して、どこで離脱しているかを見るために Microsoft Clarity（録画・ヒートマップ）を読み込む
 * 表示を妨げないよう、読み込みが終わってアイドルになってから始める
 */
export function AppClarity(): React.ReactNode {
  const { pathname } = useLocation()

  const authContext = useContext(AuthContext)

  useEffect(() => {
    if (isStarted) return
    if (CLARITY_PROJECT_ID === "") return
    if (import.meta.env.NODE_ENV === "development") return
    if (EXCLUDED_PATH.test(pathname)) return
    isStarted = true
    installClarityQueue()
    runAfterLoadIdle(() => {
      const script = document.createElement("script")
      script.async = true
      script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_PROJECT_ID)}`
      document.head.appendChild(script)
    })
  }, [pathname])

  // ログインしているかで録画を絞り込めるようにする（ID などの個人を特定する値は送らない）
  useEffect(() => {
    if (authContext.isLoading) return
    window.clarity?.("set", "logged_in", authContext.isLoggedIn ? "yes" : "no")
  }, [authContext.isLoading, authContext.isLoggedIn, pathname])

  return null
}
