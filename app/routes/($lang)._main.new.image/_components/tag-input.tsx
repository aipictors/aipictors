import { type Tag, TagInput } from "@/_components/tag/tag-input"

type Props = {
  tags: Tag[]
  setTags: (value: Tag[]) => void
}

/**
 * タグ入力
 * @param props
 * @returns
 */
const TagsInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 text-sm">{"タグ"}</p>
          <TagInput
            placeholder="タグを追加してください"
            tags={props.tags.map((tag) => ({
              id: tag.id,
              text: tag.text,
              label: tag.text,
              value: tag.text,
            }))}
            className="sm:min-w-[450px]"
            setTags={(newTags) => {
              props.setTags(newTags as [Tag, ...Tag[]])
              console.log(newTags)
            }}
          />
        </div>
      </div>
    </>
  )
}

export default TagsInput
