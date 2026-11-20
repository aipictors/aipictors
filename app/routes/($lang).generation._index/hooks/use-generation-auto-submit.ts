import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { containsJapanese, useTranslation } from "~/hooks/use-translation"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { readGenerationPendingPrompt } from "~/routes/($lang).generation._index/utils/generation-simple-entry"

/**
 * かんたん入口のプロンプトを詳細画面のプロンプト欄に入れる。
 * 日本語なら既存の「日本語で生成」を使う（AI が日本語の文章からプロンプトを作る）
 */
export function useApplyGenerationEntryPrompt() {
  const context = useGenerationContext()
  return (prompt: string) => {
    context.updatePrompt(prompt)
    context.changeLanguageUsedForPrompt(containsJapanese(prompt) ? "jp" : null)
  }
}

type Props = {
  /**
   * 生成ボタンを押したときと同じ確認ができる状態か（ユーザー・モデル・コイン残高などが読めた）
   */
  isReady: boolean
  /**
   * 生成ボタンを押したときの処理（コイン不足の案内などもここで出る）
   */
  onSubmit: () => Promise<unknown>
}

/**
 * かんたん入口で「生成する」を押したあと（未ログインならログインのあと）に、詳細画面で生成を始める。
 * 生成ボタンを押したときと同じ処理を 1 回だけ呼ぶ。生成画面には送信欄がいくつかあるので、
 * 最初に保存を消した 1 つだけが呼ぶ
 */
export function useGenerationAutoSubmit(props: Props) {
  const context = useGenerationContext()

  const t = useTranslation()

  const applyPrompt = useApplyGenerationEntryPrompt()

  const hasSignedTerms = context.user?.hasSignedImageGenerationTerms === true

  const promptText = context.config.promptText

  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (!props.isReady || hasSubmittedRef.current) return
    const pending = readGenerationPendingPrompt()
    if (pending === null) return

    // 先にプロンプト欄に入れて、入ったあとの設定で生成する
    if (promptText !== pending.prompt) {
      applyPrompt(pending.prompt)
      return
    }

    // 利用規約への同意がまだなら、同意のボタンを押してもらう（同意すると読み込み直すので、そのあと始める）
    if (!hasSignedTerms) {
      // 送信欄がいくつあっても 1 つだけ出す
      toast(
        t(
          "「生成」を押して利用規約に同意すると、入力したプロンプトで生成が始まります",
          "Press Generate and accept the terms to start generating with your prompt",
        ),
        { id: "generation-entry-terms", position: "top-center" },
      )
      return
    }

    hasSubmittedRef.current = true
    void props.onSubmit()
  }, [props.isReady, promptText, hasSignedTerms])
}
