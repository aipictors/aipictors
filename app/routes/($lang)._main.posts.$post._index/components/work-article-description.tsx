import type { Dispatch, SetStateAction } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

export const parseTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
          key={index.toString()}
          href={part}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

/**
 * 作品の説明と翻訳のリンク
 */
export function WorkArticleDescription(props: {
  displayDescription: string
  isDescriptionExpanded: boolean
  isDescriptionLong: boolean
  isShowingTranslation: boolean
  isTranslating: boolean
  onClickTranslate: () => void
  setIsDescriptionExpanded: Dispatch<SetStateAction<boolean>>
  shouldShowTranslateLink: boolean
  translateLinkLabel: string
  translatedDescription: string
}) {
  const t = useTranslation()
  const {
    displayDescription,
    isDescriptionExpanded,
    isDescriptionLong,
    isShowingTranslation,
    isTranslating,
    onClickTranslate,
    setIsDescriptionExpanded,
    shouldShowTranslateLink,
    translateLinkLabel,
    translatedDescription,
  } = props

  return (
    <div className="space-y-2">
      {/* キャプションがタグや生成情報に埋もれないように背景を付ける（空なら枠も出さない） */}
      {displayDescription.trim().length > 0 && (
        <div className="space-y-2 rounded-lg bg-muted px-3 py-2.5">
          <p
            className={cn(
              "overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed md:text-base",
              isDescriptionLong && !isDescriptionExpanded && "line-clamp-6",
            )}
          >
            {parseTextWithLinks(displayDescription)}
          </p>
          {isDescriptionLong && (
            <button
              type="button"
              className="font-medium text-muted-foreground text-sm hover:text-foreground"
              onClick={() => setIsDescriptionExpanded((value) => !value)}
            >
              {isDescriptionExpanded
                ? t("閉じる", "Show less")
                : t("続きを読む", "Read more")}
            </button>
          )}
        </div>
      )}
      {shouldShowTranslateLink && (
        <button
          type="button"
          onClick={onClickTranslate}
          disabled={isTranslating}
          className="text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground disabled:cursor-default disabled:opacity-50"
        >
          {isShowingTranslation
            ? t("原文を表示", "Show original")
            : translateLinkLabel}
        </button>
      )}
      {isShowingTranslation && displayDescription.length > 0 && (
        <div className="rounded-md bg-muted p-2">
          {isTranslating ? (
            <p className="text-muted-foreground text-xs">
              {t("翻訳中...", "Translating...")}
            </p>
          ) : (
            <p className="whitespace-pre-wrap break-words text-muted-foreground text-sm">
              {translatedDescription}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
