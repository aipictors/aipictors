import { LanguagesIcon } from "lucide-react"
import type { AutoTranslation } from "~/hooks/use-auto-translation"
import { useAutoTranslation } from "~/hooks/use-auto-translation"
import { cn } from "~/lib/utils"

/**
 * 自動翻訳した文の下に出す「Translated · Show original」の切り替え（訳がないときは何も出さない）
 */
export function AutoTranslationToggle(props: {
  translation: AutoTranslation
  className?: string
}) {
  if (!props.translation.isTranslated) return null
  return (
    <button
      type="button"
      onClick={(event) => {
        // カードのリンクの中に置かれても、ページを移らない
        event.preventDefault()
        event.stopPropagation()
        props.translation.toggle()
      }}
      className={cn(
        "inline-flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground",
        props.className,
      )}
    >
      <LanguagesIcon className="size-3" />
      {props.translation.isShowingOriginal ? (
        <span className="underline underline-offset-2">Show translation</span>
      ) : (
        <>
          <span>Translated</span>
          <span aria-hidden>·</span>
          <span className="underline underline-offset-2">Show original</span>
        </>
      )}
    </button>
  )
}

/**
 * 利用者が書いた文。英語の画面では日本語を自動で英語にして、原文との切り替えを付ける
 */
export function AutoTranslatedText(props: {
  text: string | null | undefined
  className?: string
  toggleClassName?: string
}) {
  const translation = useAutoTranslation(props.text)
  return (
    <>
      <p className={props.className}>{translation.text}</p>
      <AutoTranslationToggle
        translation={translation}
        className={props.toggleClassName}
      />
    </>
  )
}

/**
 * 文の中に置く短い文（タイトル・お知らせなど）。英語の画面では日本語を自動で英語にする（切り替えは付けない）
 */
export function AutoTranslatedInline(props: {
  text: string | null | undefined
}) {
  return <>{useAutoTranslation(props.text).text}</>
}
