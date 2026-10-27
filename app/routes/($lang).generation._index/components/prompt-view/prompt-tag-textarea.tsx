import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLocalStorage } from "usehooks-ts"
import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Textarea } from "~/components/ui/textarea"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  hasKana,
  kanaToRomaji,
} from "~/routes/($lang).generation._index/utils/kana-to-romaji"
import {
  applyPromptTag,
  findPromptToken,
  formatTagCount,
  formatTagForDisplay,
  formatTagForPrompt,
  loadPromptTagDictionary,
  type PromptTag,
  searchPromptTags,
} from "~/routes/($lang).generation._index/utils/prompt-tag-suggestions"

type Props = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string
  onValueChange(value: string): void
  /**
   * list: 入力欄の下に一覧（PC）/ chips: 入力欄の下に横並び（スマホ）
   */
  variant?: "list" | "chips"
  autoResize?: boolean
  minHeight?: string
  /** Ctrl / ⌘ + Enter */
  onSubmitShortcut?(): void
  suggestionsClassName?: string
  /**
   * かなだけの単語をローマ字に読み替えて候補を出す（日本語入力がオンのまま英語のタグを打ったとき用）
   * 日本語の文章で入力するモードでは false にする
   */
  allowsKanaQuery?: boolean
}

export const TAG_SUGGESTIONS_STORAGE_KEY = "generation.tagSuggestions"

/**
 * 候補を探す文字（かなだけの単語はローマ字に読み替える。例: 「すみ」「ｓみ」→ sumi / smi）
 */
const toSearchQuery = (query: string, allowsKanaQuery: boolean) => {
  const text = query.normalize("NFKC")
  if (!allowsKanaQuery || !hasKana(text)) return text
  // 漢字が入っていれば日本語の文章とみなす
  if (/[\u4e00-\u9fff]/.test(text)) return text
  return kanaToRomaji(text)
}

/**
 * タグの種類ごとの件数バッジの色（一般は件数が多いほど濃く）
 */
const countBadgeClassName = (tag: PromptTag) => {
  if (tag.type === 4) return "bg-emerald-700 text-white"
  if (tag.type === 3) return "bg-fuchsia-700 text-white"
  if (tag.type === 1) return "bg-rose-700 text-white"
  if (tag.type === 5) return "bg-orange-600 text-white"
  if (tag.count >= 5000) return "bg-amber-800 text-white"
  if (tag.count >= 1000) return "bg-amber-700 text-white"
  return "bg-amber-500 text-white"
}

/**
 * タグ候補つきのプロンプト入力欄
 * カンマ区切りで入力中の単語に合う Danbooru のタグを件数つきで出す
 */
export const PromptTagTextarea = forwardRef<HTMLTextAreaElement, Props>(
  (props, forwardedRef) => {
    const {
      value,
      onValueChange,
      variant = "list",
      autoResize = false,
      minHeight,
      onSubmitShortcut,
      suggestionsClassName,
      allowsKanaQuery = true,
      onKeyDown,
      onBlur,
      onFocus,
      className,
      ...rest
    } = props

    const t = useTranslation()

    const [isEnabled, setIsEnabled] = useLocalStorage(
      TAG_SUGGESTIONS_STORAGE_KEY,
      true,
    )

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof forwardedRef === "function") {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef],
    )

    const [dictionary, setDictionary] = useState<PromptTag[] | null>(null)

    const [cursor, setCursor] = useState<number | null>(null)

    const [isFocused, setIsFocused] = useState(false)

    const [activeIndex, setActiveIndex] = useState(0)

    /** Esc で閉じた単語（同じ単語のあいだは出さない） */
    const [dismissedQuery, setDismissedQuery] = useState<string | null>(null)

    const loadDictionary = () => {
      if (dictionary !== null || !isEnabled) return
      loadPromptTagDictionary()
        .then(setDictionary)
        .catch(() => {
          // 候補が出ないだけなので何もしない
        })
    }

    const token = useMemo(() => {
      if (cursor === null) return null
      return findPromptToken(value, Math.min(cursor, value.length))
    }, [value, cursor])

    const suggestions = useMemo(() => {
      if (!isEnabled || dictionary === null || token === null) return []
      if (token.query === dismissedQuery) return []
      return searchPromptTags(
        dictionary,
        toSearchQuery(token.query, allowsKanaQuery),
        8,
      )
    }, [isEnabled, dictionary, token, dismissedQuery, allowsKanaQuery])

    const isOpen = isFocused && suggestions.length > 0

    useEffect(() => {
      setActiveIndex(0)
    }, [token?.query])

    const updateCursor = () => {
      const element = textareaRef.current
      if (element === null) return
      setCursor(
        element.selectionStart === element.selectionEnd
          ? element.selectionStart
          : null,
      )
    }

    const accept = (tag: PromptTag) => {
      if (token === null) return
      const next = applyPromptTag(value, token, formatTagForPrompt(tag.name))
      onValueChange(next.text)
      setCursor(next.cursor)
      requestAnimationFrame(() => {
        const element = textareaRef.current
        if (element === null) return
        element.focus({ preventScroll: true })
        element.setSelectionRange(next.cursor, next.cursor)
      })
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        onSubmitShortcut &&
        event.key === "Enter" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        onSubmitShortcut()
        return
      }
      if (isOpen && !event.nativeEvent.isComposing) {
        if (event.key === "ArrowDown") {
          event.preventDefault()
          setActiveIndex((index) => (index + 1) % suggestions.length)
          return
        }
        if (event.key === "ArrowUp") {
          event.preventDefault()
          setActiveIndex(
            (index) => (index - 1 + suggestions.length) % suggestions.length,
          )
          return
        }
        if (event.key === "Tab" || (event.key === "Enter" && !event.shiftKey)) {
          event.preventDefault()
          accept(suggestions[activeIndex] ?? suggestions[0])
          return
        }
        if (event.key === "Escape") {
          event.preventDefault()
          event.stopPropagation()
          setDismissedQuery(token?.query ?? null)
          return
        }
      }
      onKeyDown?.(event)
    }

    const textareaProps = {
      ...rest,
      ref: setRefs,
      value,
      className,
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(event.target.value)
        setDismissedQuery(null)
        setCursor(
          event.target.selectionStart === event.target.selectionEnd
            ? event.target.selectionStart
            : null,
        )
      },
      onSelect: updateCursor,
      onClick: updateCursor,
      onKeyDown: handleKeyDown,
      onFocus: (event: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true)
        loadDictionary()
        onFocus?.(event)
      },
      onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => {
        // スマホは候補をタップした瞬間に入力欄のフォーカスが外れるので、少し待ってから閉じる
        setTimeout(() => {
          if (document.activeElement !== textareaRef.current) {
            setIsFocused(false)
          }
        }, 200)
        onBlur?.(event)
      },
    }

    const list = isOpen && (
      <div
        className={cn(
          variant === "list"
            ? "absolute top-full left-0 z-50 mt-1 w-72 max-w-full overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
            : "-mx-1 flex gap-1.5 overflow-x-auto px-1 pt-2 pb-1 [scrollbar-width:none]",
          suggestionsClassName,
        )}
        // 候補を押してもフォーカスを外さない
        onMouseDown={(event) => event.preventDefault()}
      >
        {variant === "list" && (
          <div className="flex items-center justify-between border-b px-2.5 py-1 text-muted-foreground text-xs">
            <span>{t("タグ候補", "Tag Suggestions")}</span>
            <button
              type="button"
              className="font-medium underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => setIsEnabled(false)}
            >
              {t("オフにする", "Turn off")}
            </button>
          </div>
        )}
        <ul className={cn(variant === "list" ? "py-1" : "contents")}>
          {suggestions.map((tag, index) => (
            <li
              key={tag.name}
              className={cn(variant === "chips" && "shrink-0")}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-left text-sm",
                  variant === "list"
                    ? "w-full px-2.5 py-1"
                    : "rounded-full border bg-background px-3 py-1.5 shadow-sm active:bg-muted",
                  variant === "list" && index === activeIndex && "bg-muted",
                )}
                onMouseEnter={() => {
                  if (variant === "list") setActiveIndex(index)
                }}
                onClick={() => accept(tag)}
              >
                <span
                  className={cn(
                    "min-w-0 truncate",
                    variant === "chips" && "max-w-48",
                  )}
                >
                  {formatTagForDisplay(tag.name)}
                  {tag.matchedAlias && variant === "list" && (
                    <span className="ml-1 text-muted-foreground text-xs">
                      ← {formatTagForDisplay(tag.matchedAlias)}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded px-1 py-px font-semibold text-[10px] tabular-nums leading-tight",
                    countBadgeClassName(tag),
                  )}
                >
                  {formatTagCount(tag.count)}
                </span>
                {variant === "list" && index === activeIndex && (
                  <span className="ml-auto shrink-0 rounded border px-1 text-[10px] text-muted-foreground leading-tight">
                    TAB
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )

    return (
      <div className={cn("relative", variant === "chips" && "flex flex-col")}>
        {autoResize ? (
          <AutoResizeTextarea {...textareaProps} minHeight={minHeight} />
        ) : (
          <Textarea {...textareaProps} />
        )}
        {list}
      </div>
    )
  },
)

PromptTagTextarea.displayName = "PromptTagTextarea"
