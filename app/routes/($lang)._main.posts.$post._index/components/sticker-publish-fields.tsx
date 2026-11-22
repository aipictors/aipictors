import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { PlusIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

/** API と同じ上限（aipictors-system lib/sticker-tags.ts） */
export const STICKER_TAGS_LIMIT = 10
const STICKER_TAG_MAX_LENGTH = 20

/** 前後の空白と先頭の # を外す（API でも同じようにそろえる） */
const toStickerTag = (value: string) =>
  Array.from(
    value
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[#＃]+\s*/, ""),
  )
    .slice(0, STICKER_TAG_MAX_LENGTH)
    .join("")
    .trim()

type Props = {
  title: string
  tags: string[]
  onChangeTitle(value: string): void
  onChangeTags(value: string[]): void
  /** タイトルを出さない（タグだけ編集する） */
  isTagsOnly?: boolean
  className?: string
}

/**
 * スタンプを公開するときに決める項目（タイトル、タグ）
 */
export function StickerPublishFields(props: Props) {
  const t = useTranslation()

  return (
    <div className={cn("space-y-3", props.className)}>
      {!props.isTagsOnly && (
        <div className="space-y-1.5">
          <p className="font-medium text-sm">{t("タイトル", "Title")}</p>
          <Input
            value={props.title}
            onChange={(event) => props.onChangeTitle(event.target.value)}
            placeholder={t("例: ありがとう", "e.g. Thank you")}
          />
        </div>
      )}
      <StickerTagsField tags={props.tags} onChange={props.onChangeTags} />
    </div>
  )
}

function StickerTagsField(props: {
  tags: string[]
  onChange(value: string[]): void
}) {
  const t = useTranslation()

  const [text, setText] = useState("")

  const { data } = useQuery(recommendedStickerTagsQuery, {
    variables: { limit: 20 },
  })

  const isFull = props.tags.length >= STICKER_TAGS_LIMIT

  const addTags = (values: string[]) => {
    const next = [...props.tags]
    for (const value of values) {
      const tag = toStickerTag(value)
      if (tag === "") continue
      if (next.some((item) => item.toLowerCase() === tag.toLowerCase())) {
        continue
      }
      if (next.length >= STICKER_TAGS_LIMIT) break
      next.push(tag)
    }
    props.onChange(next)
  }

  const removeTag = (tag: string) => {
    props.onChange(props.tags.filter((item) => item !== tag))
  }

  const commitText = () => {
    // 読点・カンマ区切りでまとめて入れられる
    addTags(text.split(/[,、，\n]/))
    setText("")
  }

  const suggestions = (data?.recommendedStickerTags ?? []).filter(
    (tag) => !props.tags.includes(tag),
  )

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium text-sm">{t("タグ", "Tags")}</p>
        <span className="text-muted-foreground text-xs tabular-nums">
          {props.tags.length}/{STICKER_TAGS_LIMIT}
        </span>
      </div>
      {props.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {props.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-foreground py-1 pr-1 pl-3 text-background text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="rounded-full p-0.5 hover:bg-background/20"
                aria-label={t(`${tag} を外す`, `Remove ${tag}`)}
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={text}
          disabled={isFull}
          maxLength={100}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return
            if (event.key === "Enter") {
              event.preventDefault()
              commitText()
            }
            if (
              event.key === "Backspace" &&
              text === "" &&
              props.tags.length > 0
            ) {
              removeTag(props.tags[props.tags.length - 1])
            }
          }}
          onBlur={() => {
            if (text.trim() !== "") commitText()
          }}
          placeholder={
            isFull
              ? t("タグは 10 個までです", "Up to 10 tags")
              : t("タグを入力して Enter", "Type a tag and press Enter")
          }
        />
        <button
          type="button"
          disabled={isFull || text.trim() === ""}
          onClick={commitText}
          className="flex shrink-0 items-center gap-1 rounded-md border px-3 text-sm hover:bg-muted disabled:opacity-50"
        >
          <PlusIcon className="size-4" />
          {t("追加", "Add")}
        </button>
      </div>
      {suggestions.length > 0 && !isFull && (
        <div className="space-y-1 pt-1">
          <p className="text-muted-foreground text-xs">
            {t("おすすめのタグ", "Suggested tags")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTags([tag])}
                className="rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const recommendedStickerTagsQuery = graphql(
  `query RecommendedStickerTags($limit: Int) {
    recommendedStickerTags(limit: $limit)
  }`,
)
