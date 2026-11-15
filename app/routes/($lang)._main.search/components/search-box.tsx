import { useQuery } from "@apollo/client/index"
import {
  ArrowUpLeftIcon,
  HashIcon,
  HistoryIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { type FormEvent, useEffect, useId, useRef, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  isListableTagName,
  SEARCH_TAGS_PAGE_SIZE,
  searchTagsQuery,
} from "~/routes/($lang)._main.search/components/search-tags-panel"
import { loadRecentSearches, saveRecentSearches } from "~/utils/recent-searches"
import { toResizedImageUrl } from "~/utils/resized-image-url"
import {
  isFeaturableSensitiveTag,
  isSuggestableSensitiveTag,
} from "~/utils/sensitive-tag-filter"

type Props = {
  value: string
  onValueChange: (value: string) => void
  /** 言葉を決めたとき（入力・候補・最近の検索・人気のタグ） */
  onSubmit: (text: string) => void
  popularTags: { name: string }[]
  isSensitiveMode: boolean
  /** 欄の右に並べるもの（全年齢 / R18 の切り替え） */
  trailing?: React.ReactNode
}

/** 打つのを止めてから候補を取りに行くまで（打つたびに問い合わせない） */
const SUGGEST_DEBOUNCE_MS = 350

/**
 * アプリと同じ丸い検索欄。フォーカスすると、空のときは最近の検索と人気のタグ、
 * 打っている間は「〇〇で検索」と名前に言葉を含むタグの候補を出す。
 * 候補は「タグ」タブと同じ問い合わせ・同じ条件なので、タグタブを開いたときは取り直さない
 */
export function SearchBox(props: Props) {
  const t = useTranslation()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const text = props.value.trim().replace(/^[#＃]+/, "")
  const [debouncedText] = useDebounceValue(text, SUGGEST_DEBOUNCE_MS)

  useEffect(() => {
    if (isOpen) setRecent(loadRecentSearches())
  }, [isOpen])

  // 外を押したら閉じる
  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isOpen])

  const { data, loading } = useQuery(searchTagsQuery, {
    skip: !isOpen || debouncedText === "",
    variables: {
      offset: 0,
      limit: SEARCH_TAGS_PAGE_SIZE,
      where: { search: debouncedText },
    },
  })

  const suggestions =
    text === "" || debouncedText !== text
      ? []
      : (data?.tags ?? [])
          .filter(
            (tag) =>
              isListableTagName(tag.name) &&
              (props.isSensitiveMode
                ? isFeaturableSensitiveTag(tag.name)
                : isSuggestableSensitiveTag(tag.name)),
          )
          // 完全一致・前方一致を先に、短い順（アプリと同じ）
          .map((tag) => ({
            tag,
            score: tag.name === text ? 0 : tag.name.startsWith(text) ? 1 : 2,
          }))
          .sort(
            (a, b) =>
              a.score - b.score || a.tag.name.length - b.tag.name.length,
          )
          .slice(0, 8)
          .map(({ tag }) => tag)

  const submit = (value: string) => {
    const normalized = value.trim().replace(/^[#＃]+/, "")
    if (normalized === "") return
    setIsOpen(false)
    inputRef.current?.blur()
    props.onValueChange(normalized)
    props.onSubmit(normalized)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit(props.value)
  }

  const removeRecent = (value: string) => {
    const next = recent.filter((item) => item !== value)
    setRecent(next)
    saveRecentSearches(next)
  }

  const isSuggestLoading = loading || (text !== "" && debouncedText !== text)

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-2">
        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border-[1.5px] bg-muted pr-1 pl-4 transition-colors",
            isOpen ? "border-[#0170C8]/60 bg-background" : "border-transparent",
          )}
        >
          <SearchIcon
            aria-hidden
            className={cn(
              "size-5 shrink-0",
              isOpen
                ? "text-[#0170C8] dark:text-sky-400"
                : "text-muted-foreground",
            )}
          />
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={props.value}
            onChange={(event) => {
              props.onValueChange(event.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setIsOpen(false)
                inputRef.current?.blur()
              }
            }}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-label={t("検索する言葉", "Search")}
            placeholder={t(
              "タグ・キーワード・ユーザーを検索",
              "Search tags, keywords and users",
            )}
            // 16px（iOS Safari がフォーカスで拡大しない大きさ）
            className="h-full min-w-0 flex-1 bg-transparent font-semibold text-base outline-hidden placeholder:font-normal placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {props.value !== "" && (
            <button
              type="button"
              aria-label={t("入力を消す", "Clear")}
              onClick={() => {
                props.onValueChange("")
                setIsOpen(true)
                inputRef.current?.focus()
              }}
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-5" />
            </button>
          )}
        </form>
        {isOpen ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              inputRef.current?.blur()
            }}
            className="h-10 shrink-0 px-2 font-semibold text-[#0170C8] text-sm dark:text-sky-400"
          >
            {t("キャンセル", "Cancel")}
          </button>
        ) : (
          props.trailing
        )}
      </div>

      {isOpen && (
        <div
          id={listId}
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain rounded-2xl border bg-popover pb-2 text-popover-foreground shadow-xl"
        >
          <div
            className={cn(
              "h-0.5 w-full overflow-hidden",
              isSuggestLoading && "bg-[#0170C8]/20",
            )}
          >
            {isSuggestLoading && (
              <div className="h-full w-1/3 animate-[aip-indeterminate_1s_ease-in-out_infinite] bg-[#0170C8]" />
            )}
          </div>
          {text === "" ? (
            <>
              {recent.length > 0 && (
                <section className="pt-2">
                  <div className="flex items-center justify-between pr-2 pl-4">
                    <h2 className="font-bold text-sm">
                      {t("最近の検索", "Recent searches")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setRecent([])
                        saveRecentSearches([])
                      }}
                      className="h-10 px-2 font-semibold text-[#0170C8] text-xs dark:text-sky-400"
                    >
                      {t("すべて消す", "Clear all")}
                    </button>
                  </div>
                  <ul>
                    {recent.slice(0, 10).map((item) => (
                      <li key={item} className="flex items-center">
                        <button
                          type="button"
                          onClick={() => submit(item)}
                          className="flex h-11 min-w-0 flex-1 items-center gap-3 px-4 text-left text-[15px] hover:bg-muted"
                        >
                          <HistoryIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{item}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={t(`「${item}」を消す`, `Remove ${item}`)}
                          onClick={() => removeRecent(item)}
                          className="flex size-11 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {props.popularTags.length > 0 && (
                <section className="px-4 pt-3 pb-2">
                  <h2 className="mb-2.5 font-bold text-sm">
                    {t("人気のタグ", "Popular tags")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {props.popularTags.slice(0, 16).map((tag) => (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => submit(tag.name)}
                        className="inline-flex h-10 items-center rounded-full border bg-background px-4 font-medium text-sm transition-colors hover:border-foreground/40"
                      >
                        <span className="mr-0.5 text-muted-foreground">#</span>
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {recent.length === 0 && props.popularTags.length === 0 && (
                <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                  {t(
                    "タグやキーワードで作品・ユーザーを探せます",
                    "Find works and users by tag or keyword",
                  )}
                </p>
              )}
            </>
          ) : (
            <ul className="pt-1">
              <li>
                <button
                  type="button"
                  onClick={() => submit(text)}
                  className="flex h-14 w-full items-center gap-3 px-4 text-left hover:bg-muted"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0170C8]/10 text-[#0170C8] dark:text-sky-400">
                    <SearchIcon className="size-5" />
                  </span>
                  <span className="min-w-0 truncate text-[15px]">
                    <span className="font-extrabold">「{text}」</span>
                    {t(" で検索", "")}
                  </span>
                </button>
              </li>
              {suggestions.map((tag) => {
                // 全年齢の検索では、最初の作品が全年齢のときだけ画像を出す（タグタブと同じ）
                const thumbnailUrl =
                  tag.firstWork &&
                  (props.isSensitiveMode || tag.firstWork.rating === "G")
                    ? tag.firstWork.smallThumbnailImageURL
                    : null
                return (
                  <li key={tag.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => submit(tag.name)}
                      className="flex h-14 min-w-0 flex-1 items-center gap-3 px-4 text-left hover:bg-muted"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-linear-to-br from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] text-white">
                        {thumbnailUrl ? (
                          <img
                            src={toResizedImageUrl(thumbnailUrl, 120)}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                          />
                        ) : (
                          <HashIcon className="size-5" />
                        )}
                      </span>
                      <HighlightedName name={tag.name} query={text} />
                    </button>
                    <button
                      type="button"
                      aria-label={t(
                        `「${tag.name}」を入力欄に入れる`,
                        `Use ${tag.name}`,
                      )}
                      onClick={() => {
                        props.onValueChange(tag.name)
                        inputRef.current?.focus()
                      }}
                      className="flex size-12 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <ArrowUpLeftIcon className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/** 打った言葉の部分を太字・色付きにする */
function HighlightedName(props: { name: string; query: string }) {
  const index = props.name.toLowerCase().indexOf(props.query.toLowerCase())
  if (index < 0) {
    return <span className="min-w-0 truncate text-[15px]">{props.name}</span>
  }
  return (
    <span className="min-w-0 truncate text-[15px]">
      {props.name.slice(0, index)}
      <span className="font-black text-[#0170C8] dark:text-sky-400">
        {props.name.slice(index, index + props.query.length)}
      </span>
      {props.name.slice(index + props.query.length)}
    </span>
  )
}
