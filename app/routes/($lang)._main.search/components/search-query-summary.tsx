import { PencilIcon, SearchIcon, XIcon } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  /** 今の検索語 */
  query: string
  /** 言葉を変えて探し直す（絞り込み・並べ替えはそのまま） */
  onSubmit: (text: string) => void
  /** 言葉を外して探すの入口に戻る */
  onClear: () => void
  /** 絞り込みを使っている数（0 なら出さない） */
  activeFilterCount: number
  /** 右に並べるもの（全年齢 / R18 の切り替え） */
  trailing?: React.ReactNode
}

/**
 * 検索語があるときのページ内の小さい表示（検索語＋絞り込み）。
 * 検索欄はヘッダーの 1 つだけにして（タグの候補・最近の検索もそこで出す）、ここは今の言葉と絞り込みを見せる。
 * 「言葉を変える」を押したときだけ、絞り込み・並べ替えを残したまま言葉を変えられる欄にする
 */
export function SearchQuerySummary(props: Props) {
  const t = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(props.query)

  useEffect(() => {
    setText(props.query)
    setIsEditing(false)
  }, [props.query])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = text.trim().replace(/^[#＃]+/, "")
    if (normalized === "") {
      props.onClear()
      return
    }
    if (normalized === props.query) {
      setIsEditing(false)
      return
    }
    props.onSubmit(normalized)
  }

  const cancel = () => {
    setText(props.query)
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <form
          onSubmit={handleSubmit}
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#0170C8]/60 bg-background pr-1 pl-3.5 md:max-w-md"
        >
          <SearchIcon
            aria-hidden
            className="size-4 shrink-0 text-[#0170C8] dark:text-sky-400"
          />
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            // biome-ignore lint/a11y/noAutofocus: 「言葉を変える」を押したときだけ出す欄なので、すぐ打てるようにする
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") cancel()
            }}
            aria-label={t(
              "絞り込みを残したまま探し直す",
              "Search again with the same filters",
            )}
            // 16px（iOS Safari がフォーカスで拡大しない大きさ）
            className="h-full min-w-0 flex-1 bg-transparent font-semibold text-base outline-hidden md:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={cancel}
            className="h-8 shrink-0 px-2 font-semibold text-[#0170C8] text-xs dark:text-sky-400"
          >
            {t("やめる", "Cancel")}
          </button>
        </form>
      ) : (
        <div className="flex h-10 min-w-0 items-center gap-1.5 rounded-full border bg-background pr-1 pl-3.5 text-sm">
          <SearchIcon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 truncate font-semibold">{props.query}</span>
          {props.activeFilterCount > 0 && (
            <span className="shrink-0 rounded-full bg-[#0170C8]/10 px-2 py-0.5 font-semibold text-[#0170C8] text-xs dark:text-sky-400">
              {t(
                `絞り込み ${props.activeFilterCount}`,
                `${props.activeFilterCount} filters`,
              )}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={t(
              "絞り込みを残したまま言葉を変える",
              "Change the words and keep the filters",
            )}
            className="flex h-8 shrink-0 items-center gap-1 rounded-full px-2 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
          >
            <PencilIcon className="size-3.5" />
            <span className="hidden sm:inline">
              {t("言葉を変える", "Edit")}
            </span>
          </button>
          <button
            type="button"
            aria-label={t("検索語を外す", "Clear search")}
            onClick={props.onClear}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}
      {props.trailing}
    </div>
  )
}
