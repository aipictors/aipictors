// https://github.com/JaleelB/emblor/blob/main/website/components/tag/autocomplete.tsx

import type React from "react"
import { useMemo, useState } from "react"
import { Command } from "~/components/ui/command"
import type { Tag as TagType } from "./tag-input"

type AutocompleteProps = {
  tags: TagType[]
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>
  autocompleteOptions: TagType[]
  /** 入力中の文字。候補はこれで絞り込む */
  query: string
  maxTags?: number
  onTagAdd?: (tag: string) => void
  onSelected?: () => void
  allowDuplicates: boolean
  children: React.ReactNode
}

/** 候補は 2,000 件以上あるので、一度に出すのはこれだけにする */
const MAX_VISIBLE_OPTIONS = 30

/** 候補を出すのに入力欄の下に欲しい高さ（投稿バーの分を含む） */
const OPTIONS_HEIGHT_PX = 320

/** 候補を入力で絞り込む。前方一致を先に並べる */
export const filterAutocompleteOptions = (
  options: TagType[],
  query: string,
): TagType[] => {
  const normalized = query.trim().toLowerCase()
  if (normalized.length === 0) return []
  const startsWith: TagType[] = []
  const includes: TagType[] = []
  for (const option of options) {
    const text = option.text.toLowerCase()
    if (text.startsWith(normalized)) startsWith.push(option)
    else if (text.includes(normalized)) includes.push(option)
  }
  return [...startsWith, ...includes].slice(0, MAX_VISIBLE_OPTIONS)
}

export function Autocomplete ({
  tags,
  setTags,
  autocompleteOptions,
  query,
  maxTags,
  onTagAdd,
  onSelected,
  allowDuplicates,
  children,
}: AutocompleteProps): React.ReactNode {
  const [isFocused, setIsFocused] = useState(false)

  const visibleOptions = useMemo(
    () => filterAutocompleteOptions(autocompleteOptions, query),
    [autocompleteOptions, query],
  )

  return (
    <Command
      shouldFilter={false}
      className="relative overflow-visible rounded-md border"
      onFocusCapture={(event) => {
        setIsFocused(true)
        // 画面の下の方だと候補が入らない。スマホはキーボードでさらに狭くなる
        const { bottom } = event.target.getBoundingClientRect()
        if (bottom > window.innerHeight - OPTIONS_HEIGHT_PX) {
          event.target.scrollIntoView({ block: "center", behavior: "smooth" })
        }
      }}
      onBlurCapture={() => setIsFocused(false)}
    >
      {children}
      {isFocused && visibleOptions.length > 0 && (
        // cmdk の項目にすると Enter で先頭の候補まで追加される（Enter は打った文字をタグにする）ので、普通のボタンにする
        <div className="absolute top-full right-0 left-0 z-40 mt-1 max-h-60 overflow-y-auto rounded-md border bg-popover p-1 shadow-lg">
          {visibleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              data-tag-option
              className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              // 押した瞬間に入力欄からフォーカスが外れて候補が閉じないように
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (maxTags && tags.length >= maxTags) return
                if (
                  !allowDuplicates &&
                  tags.some((tag) => tag.text === option.text)
                )
                  return
                setTags([...tags, option])
                onTagAdd?.(option.text)
                onSelected?.()
              }}
            >
              {option.text}
            </button>
          ))}
        </div>
      )}
    </Command>
  )
}
