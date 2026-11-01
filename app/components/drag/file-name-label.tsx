import { PencilIcon } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  fileName: string
  /** なければ表示だけ */
  onRename?: (fileName: string) => void
}

/**
 * 画像の下のファイル名（押すとその場で変更できる）
 */
export function FileNameLabel(props: Props) {
  const t = useTranslation()
  const [draft, setDraft] = useState<string | null>(null)

  if (draft !== null) {
    const commit = () => {
      const next = draft.trim()
      if (next !== "" && next !== props.fileName) props.onRename?.(next)
      setDraft(null)
    }
    return (
      <input
        // biome-ignore lint/a11y/noAutofocus: 押した直後に入力するため
        autoFocus={true}
        value={draft}
        maxLength={200}
        aria-label={t("ファイル名", "File name")}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.target.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === "Enter") {
            event.preventDefault()
            commit()
          }
          if (event.key === "Escape") setDraft(null)
        }}
        className="mt-1 w-full rounded border bg-background px-1 py-0.5 text-[11px] leading-4 outline-none focus:ring-1 focus:ring-ring"
      />
    )
  }

  if (!props.onRename) {
    return (
      <p
        title={props.fileName}
        className="mt-1 line-clamp-2 break-all text-[11px] text-muted-foreground leading-4"
      >
        {props.fileName}
      </p>
    )
  }

  return (
    <button
      type="button"
      title={t("押すとファイル名を変更できます", "Click to rename")}
      onClick={() => setDraft(props.fileName)}
      className="group mt-1 flex w-full items-start gap-1 rounded text-left text-[11px] text-muted-foreground leading-4 hover:text-foreground"
    >
      <span className="line-clamp-2 min-w-0 flex-1 break-all">
        {props.fileName}
      </span>
      <PencilIcon className="mt-0.5 size-3 shrink-0 opacity-60 group-hover:opacity-100" />
    </button>
  )
}
