import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"
import {
  shouldAutoTranslate,
  translateAutomatically,
} from "~/utils/auto-translate"
import { parseLocalePath } from "~/utils/locale-path"

export type AutoTranslation = {
  /** 画面に出す文（訳があって原文に切り替えていなければ訳） */
  text: string
  /** 訳がある（切り替えのボタンを出す） */
  isTranslated: boolean
  /** 原文を出している */
  isShowingOriginal: boolean
  toggle: () => void
}

/**
 * 利用者が書いた文（プロフィール文・リクエストの文・AI評価コメントなど）を、英語の画面では自動で英語にする。
 * 訳が届くまでと訳せなかったときは原文のまま。R18 のページは訳さない（コメントと同じ）
 */
export function useAutoTranslation(
  text: string | null | undefined,
): AutoTranslation {
  const t = useTranslation()
  const source = text ?? ""
  const shouldTranslate = t.isEnglish && shouldAutoTranslate(source, "en")

  const [translated, setTranslated] = useState<{
    source: string
    text: string
  } | null>(null)
  const [isShowingOriginal, setIsShowingOriginal] = useState(false)

  useEffect(() => {
    if (!shouldTranslate) return
    if (parseLocalePath(window.location.pathname).isSensitive) return
    let isCanceled = false
    void translateAutomatically(source, "en").then((result) => {
      if (isCanceled || result.length === 0) return
      setTranslated({ source, text: result })
    })
    return () => {
      isCanceled = true
    }
  }, [shouldTranslate, source])

  const translatedText =
    shouldTranslate && translated?.source === source ? translated.text : null

  return {
    text:
      translatedText !== null && !isShowingOriginal ? translatedText : source,
    isTranslated: translatedText !== null,
    isShowingOriginal,
    toggle: () => setIsShowingOriginal((value) => !value),
  }
}
