import { type Tag, TagInput } from "@/_components/tag/tag-input"
import { useState } from "react"

type Props = {
  tags: Tag[]
  whiteListTags: Tag[]
  setTags: (value: Tag[]) => void
}

/**
 * タグ入力
 * @param props
 * @returns
 */
export const TagsInput = (props: Props) => {
  const [isFocus, setIsFocus] = useState(false)

  const whiteListTags = isFocus ? props.whiteListTags : []

  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 font-bold text-sm">{"タグ"}</p>
          <TagInput
            placeholder="タグを追加してください"
            tags={props.tags.map((tag) => ({
              id: tag.id,
              text: tag.text,
              label: tag.text,
              value: tag.text,
            }))}
            maxTags={20}
            maxLength={160}
            className="sm:min-w-[450px]"
            setTags={(newTags) => {
              props.setTags(newTags as [Tag, ...Tag[]])
              console.log(newTags)
            }}
            onFocus={() => {
              setIsFocus(true)
            }}
            onBlur={() => {
              setIsFocus(false)
            }}
            autocompleteOptions={whiteListTags.map((tag) => ({
              id: tag.id,
              text: tag.text,
              label: tag.text,
              value: tag.text,
            }))}
            enableAutocomplete={true}
          />
        </div>
      </div>
    </>
  )
}
