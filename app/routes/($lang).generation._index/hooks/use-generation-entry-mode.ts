import { useQuery } from "@apollo/client/index"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import {
  isAdvancedEntryRequested,
  readGenerationPendingPrompt,
  readPrefersAdvancedEntry,
  savePrefersAdvancedEntry,
} from "~/routes/($lang).generation._index/utils/generation-simple-entry"
import { viewerUserQuery } from "~/routes/($lang).generation._index/utils/generation-submit-queries"

/**
 * - loading: まだ決められない（ログイン状態・生成履歴の確認中）
 * - simple: はじめての人向けのかんたん入口
 * - advanced: 今までの生成画面（詳細画面）
 */
export type GenerationEntryMode = "loading" | "simple" | "advanced"

/**
 * 生成画面を開いたときに、かんたん入口と詳細画面のどちらを出すかを決める
 * - URL の ?mode=advanced や、プロンプト・モデルを渡す既存のリンクは詳細画面
 * - 「詳細設定で開く」を押した・一度生成した・生成履歴がある人は詳細画面（localStorage に覚える）
 * - 未ログインの人と、生成履歴が 0 件の人はかんたん入口
 * ブラウザに来てから呼ぶ（生成画面はブラウザに来てから描いている）
 * enabled が false のときは常に詳細画面（/generation/3panel など）
 */
export function useGenerationEntryMode(options: { enabled?: boolean } = {}) {
  const authContext = useContext(AuthContext)

  // URL のパラメータは読み込んだあとに外されるので、開いたときに 1 回だけ見る
  const [isAdvancedChosen, setIsAdvancedChosen] = useState(() => {
    if (typeof window === "undefined") return true
    if (options.enabled === false) return true
    return (
      isAdvancedEntryRequested(window.location.search) ||
      readPrefersAdvancedEntry()
    )
  })

  // ログインのあとに生成を始めるプロンプトがあれば、履歴を待たずに詳細画面へ
  const hasPendingPrompt =
    authContext.isLoggedIn && readGenerationPendingPrompt() !== null

  const { data, error } = useQuery(viewerUserQuery, {
    skip: isAdvancedChosen || hasPendingPrompt || !authContext.isLoggedIn,
    fetchPolicy: "cache-first",
  })

  const generatedCount = data?.viewer?.user.generatedCount

  const hasGenerated =
    authContext.isLoggedIn && generatedCount !== undefined && generatedCount > 0

  useEffect(() => {
    if (hasGenerated) savePrefersAdvancedEntry()
  }, [hasGenerated])

  const mode = ((): GenerationEntryMode => {
    if (isAdvancedChosen) return "advanced"
    if (authContext.isLoading) return "loading"
    if (authContext.isNotLoggedIn) return "simple"
    if (hasPendingPrompt) return "advanced"
    // 履歴が読めないときは、今までどおり詳細画面
    if (error !== undefined) return "advanced"
    if (generatedCount === undefined) return "loading"
    return generatedCount > 0 ? "advanced" : "simple"
  })()

  /**
   * 詳細画面に切り替える（次からも詳細画面で開く）
   */
  const openAdvanced = (remember = true) => {
    if (remember) savePrefersAdvancedEntry()
    setIsAdvancedChosen(true)
  }

  return { mode, openAdvanced }
}
