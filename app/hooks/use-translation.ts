import { useLocation } from "@remix-run/react"
import { getPathLocale } from "~/utils/locale-path"

const JAPANESE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u

export const containsJapanese = (text: string) => JAPANESE.test(text)

type EnText = string | null | undefined

/**
 * 投稿者が書いた文の表示。英語の画面には、日本語を含む文を出さない
 * （R18 と未成年を示す語を含む作品は訳さないので、訳がないまま残る）
 */
export type TranslationFn = ((jaText: string, enText?: string) => string) & {
  isEnglish: boolean
  /** 作品タイトル。英語で表せないときは Untitled */
  workTitle: (title: string, enTitle: EnText) => string
  /** 説明など。英語で表せないときは空 */
  text: (jaText: EnText, enText?: EnText) => string
  /** タグ名。英語で表せないときは null（タグごと出さない） */
  tag: (name: string, enName: EnText) => string | null
}

/** 投稿者が書いた文を画面の言語に合わせる */
export const createContentText = (isEnglish: boolean) => {
  const toEnglish = (jaText: EnText, enText: EnText) => {
    const en = enText?.trim()
    if (en && !containsJapanese(en)) return en
    const ja = jaText?.trim()
    return ja && !containsJapanese(ja) ? ja : null
  }

  return {
    isEnglish,
    workTitle: (title: string, enTitle: EnText) =>
      isEnglish ? (toEnglish(title, enTitle) ?? "Untitled") : title,
    text: (jaText: EnText, enText?: EnText) =>
      isEnglish ? (toEnglish(jaText, enText) ?? "") : (jaText ?? ""),
    tag: (name: string, enName: EnText) =>
      isEnglish ? toEnglish(name, enName) : name,
  }
}

export function useTranslation(): TranslationFn {
  const { pathname } = useLocation()

  // パスに基づいて言語を決定
  const locale = getPathLocale(pathname)
  const isEnglish = locale === "en"

  // locale に基づいて適切なテキストを返す関数
  const t = (jaText: string, enText?: string): string => {
    return isEnglish ? (enText ?? jaText) : jaText
  }

  return Object.assign(t, createContentText(isEnglish))
}
