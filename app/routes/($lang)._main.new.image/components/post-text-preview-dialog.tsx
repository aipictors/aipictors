import { XIcon } from "lucide-react"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { WorkMarkdownView } from "~/routes/($lang)._main.posts.$post._index/components/lazy-work-markdown-view"

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  caption: string
  isCaptionBeforeBody: boolean
  md: string
  type: "NOVEL" | "COLUMN"
  /** カバー画像（未選択なら null） */
  coverUrl: string | null
  authorName?: string
}

/**
 * 小説・コラムのプレビュー。作品ページと同じ部品で本文を出し、「本のように読む」もそのまま試せる
 */
export function PostTextPreviewDialog(props: Props) {
  const t = useTranslation()

  useEffect(() => {
    if (!props.isOpen) {
      return
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      // 本のように読む画面が開いているときは、そちらの Esc を優先する
      if (event.key === "Escape" && !event.defaultPrevented) {
        if (document.querySelector("[data-book-reader]")) {
          return
        }
        props.onClose()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [props.isOpen, props.onClose])

  if (!props.isOpen || typeof document === "undefined") {
    return null
  }

  const caption = props.caption.trim()
  const captionView = caption ? (
    <p className="whitespace-pre-wrap break-words text-sm">{caption}</p>
  ) : null

  // 本のように読む画面（z-[70]）はこの上に開くので、こちらは z-[65]（左上のロゴ z-[61] より上）
  return createPortal(
    <div
      className="fixed inset-0 z-[65] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={t("プレビュー", "Preview")}
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="font-bold text-sm">{t("プレビュー", "Preview")}</p>
          <p className="truncate text-muted-foreground text-xs">
            {t(
              "作品ページでの見え方です。ルビや縦書きは「本のように読む」で確認できます",
              "How it will look on the work page. Use 'Read like a book' for ruby and vertical text.",
            )}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 gap-1"
          onClick={props.onClose}
        >
          <XIcon className="size-4" />
          {t("編集に戻る", "Back to editing")}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-4 p-3 pb-12 md:p-6">
          {props.isCaptionBeforeBody && captionView}
          {props.md.trim() === "" ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
              {t("本文がまだありません", "No text yet")}
            </p>
          ) : (
            <WorkMarkdownView
              thumbnailUrl={props.coverUrl ?? ""}
              md={props.md}
              title={props.title.trim() || t("（タイトルなし）", "(Untitled)")}
              workId="preview-draft"
              workType={props.type}
              authorName={props.authorName}
              foreword={props.isCaptionBeforeBody ? caption : undefined}
            />
          )}
          <h1 className="break-words font-bold text-xl leading-snug md:text-2xl">
            {props.title.trim() || t("（タイトルなし）", "(Untitled)")}
          </h1>
          {!props.isCaptionBeforeBody && captionView}
        </div>
      </div>
    </div>,
    document.body,
  )
}
